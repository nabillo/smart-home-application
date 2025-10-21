import bcrypt from 'bcryptjs';
import { query } from '../../db/index.js';

export const getAllUsers = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.user_id, 
        u.username, 
        u.email, 
        u.created_at, 
        r.role_id,
        r.role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.created_at DESC
    `);
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        users: result.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req, res) => {
  const { username, email, password, role_id } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 12);

    const newUserResult = await query(
      `INSERT INTO users (username, email, password_hash, role_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id`,
      [username, email, password_hash, role_id]
    );
    
    const userWithRoleQuery = `
        SELECT 
            u.user_id, u.username, u.email, u.created_at, r.role_id, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
    `;
    const finalUserResult = await query(userWithRoleQuery, [newUserResult.rows[0].user_id]);

    res.status(201).json({
      status: 'success',
      data: {
        user: finalUserResult.rows[0],
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role_id } = req.body;

  const fields = [];
  const values = [];
  let queryIndex = 1;

  if (username !== undefined) {
    fields.push(`username = $${queryIndex++}`);
    values.push(username);
  }
  if (email !== undefined) {
    fields.push(`email = $${queryIndex++}`);
    values.push(email);
  }
  if (password) {
    const password_hash = await bcrypt.hash(password, 12);
    fields.push(`password_hash = $${queryIndex++}`);
    values.push(password_hash);
  }
  if (role_id !== undefined) {
    fields.push(`role_id = $${queryIndex++}`);
    values.push(role_id);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update provided.' });
  }

  values.push(id);

  const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${queryIndex} RETURNING user_id`;

  try {
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userWithRoleQuery = `
        SELECT 
            u.user_id, u.username, u.email, u.created_at, r.role_id, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
    `;
    const updatedUserResult = await query(userWithRoleQuery, [id]);

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUserResult.rows[0],
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user.user_id) {
    return res.status(400).json({ message: "You cannot delete your own account." });
  }

  try {
    const deleteResult = await query('DELETE FROM users WHERE user_id = $1', [id]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
