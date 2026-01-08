import { query, pool } from '../../db/index.js';

export const getMyHomes = async (req, res) => {
  try {
    const result = await query(
      `SELECT h.home_id, h.name, r.role_name
       FROM homes h
       JOIN homemembers hm ON h.home_id = hm.home_id
       JOIN roles r ON hm.role_id = r.role_id
       WHERE hm.user_id = $1`,
      [req.user.user_id]
    );
    res.status(200).json({ status: 'success', data: { homes: result.rows } });
  } catch (error) {
    console.error('Error fetching user homes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHome = async (req, res) => {
    const { homeId } = req.params;
    try {
        const homeQuery = `
            SELECT
                h.home_id,
                h.name,
                h.created_at,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'type_id', hpt.parameter_type_id,
                            'type_name', hpt.name,
                            'parameters', hp.configured_parameters
                        )
                    )
                    FROM home_parameters hp
                    JOIN home_parameter_types hpt ON hp.parameter_type_id = hpt.parameter_type_id
                    WHERE hp.home_id = h.home_id),
                    '[]'::json
                ) as parameters
            FROM homes h
            WHERE h.home_id = $1
        `;
        const result = await query(homeQuery, [homeId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Home not found.' });
        }
        res.status(200).json({ status: 'success', data: { home: result.rows[0] } });
    } catch (error) {
        console.error('Error fetching home:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createHome = async (req, res) => {
  const { name, parameters = [] } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Home name is required.' });
  }
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const newHomeResult = await client.query(
      'INSERT INTO homes (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, req.user.user_id]
    );
    const newHome = newHomeResult.rows[0];

    // Add parameters if provided
    if (parameters.length > 0) {
        const parameterInserts = parameters.map(p =>
            client.query(
                `INSERT INTO home_parameters (home_id, parameter_type_id, configured_parameters)
                 VALUES ($1, $2, $3)`,
                [newHome.home_id, p.parameter_type_id, p.configured_parameters]
            )
        );
        await Promise.all(parameterInserts);
    }

    // Get 'Home Admin' role_id
    const roleResult = await client.query("SELECT role_id FROM roles WHERE role_name = 'Home Admin'");
    const homeAdminRoleId = roleResult.rows[0].role_id;

    // Add creator as a Home Admin
    await client.query(
      'INSERT INTO homemembers (home_id, user_id, role_id) VALUES ($1, $2, $3)',
      [newHome.home_id, req.user.user_id, homeAdminRoleId]
    );

    await client.query('COMMIT');
    res.status(201).json({ status: 'success', data: { home: newHome } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating home:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateHome = async (req, res) => {
    const { homeId } = req.params;
    const { name } = req.body; // Note: Only handling name update for now. Parameter updates are more complex.
    
    if (!name) {
        return res.status(400).json({ message: 'Home name is required for update.' });
    }

    try {
        const result = await query(
            'UPDATE homes SET name = $1 WHERE home_id = $2 RETURNING *',
            [name, homeId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Home not found.' });
        }
        res.status(200).json({ status: 'success', data: { home: result.rows[0] } });
    } catch (error) {
        console.error('Error updating home:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteHome = async (req, res) => {
    const { homeId } = req.params;
    try {
        const result = await query('DELETE FROM homes WHERE home_id = $1', [homeId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Home not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting home:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
