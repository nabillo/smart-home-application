import { query } from '../../db/index.js';

// Helper to get roles with their permissions
const getRolesWithPermissions = async (roleId = null) => {
  const baseQuery = `
    SELECT
      r.role_id,
      r.role_name,
      COALESCE(
        (
          SELECT json_agg(p.* ORDER BY p.permission_name)
          FROM permissions p
          JOIN role_permissions rp ON p.permission_id = rp.permission_id
          WHERE rp.role_id = r.role_id
        ),
        '[]'::json
      ) AS permissions
    FROM roles r
  `;

  if (roleId) {
    const result = await query(`${baseQuery} WHERE r.role_id = $1`, [roleId]);
    return result.rows[0];
  } else {
    const result = await query(`${baseQuery} ORDER BY r.role_name`);
    return result.rows;
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await getRolesWithPermissions();
    res.status(200).json({
      status: 'success',
      data: {
        roles,
      },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRole = async (req, res) => {
  const { role_name } = req.body;
  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required.' });
  }

  try {
    const newRoleResult = await query(
      'INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id, role_name',
      [role_name]
    );
    const newRole = newRoleResult.rows[0];
    newRole.permissions = []; // New roles have no permissions by default

    res.status(201).json({
      status: 'success',
      data: {
        role: newRole,
      },
    });
  } catch (error) {
    console.error('Error creating role:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A role with this name already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRole = async (req, res) => {
  const { role_id } = req.params;
  const { role_name, permission_ids } = req.body;

  if (!role_name || !Array.isArray(permission_ids)) {
    return res.status(400).json({ message: 'Role name and a list of permission IDs are required.' });
  }

  const client = await query('BEGIN');

  try {
    // Update role name
    await query('UPDATE roles SET role_name = $1 WHERE role_id = $2', [role_name, role_id]);

    // Clear existing permissions for this role
    await query('DELETE FROM role_permissions WHERE role_id = $1', [role_id]);

    // Insert new permissions
    if (permission_ids.length > 0) {
      const insertValues = permission_ids.map((pid, i) => `($1, $${i + 2})`).join(',');
      const insertQuery = `INSERT INTO role_permissions (role_id, permission_id) VALUES ${insertValues}`;
      await query(insertQuery, [role_id, ...permission_ids]);
    }

    await query('COMMIT');

    const updatedRole = await getRolesWithPermissions(role_id);

    res.status(200).json({
      status: 'success',
      data: {
        role: updatedRole,
      },
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating role:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A role with this name already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRole = async (req, res) => {
  const { role_id } = req.params;

  try {
    const deleteResult = await query('DELETE FROM roles WHERE role_id = $1', [role_id]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting role:', error);
     if (error.code === '23503') { // foreign key violation
      return res.status(409).json({ message: 'Cannot delete role. It is currently assigned to one or more users.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
