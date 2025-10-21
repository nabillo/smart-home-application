import { query } from '../../db/index.js';

export const getAllPermissions = async (req, res) => {
  try {
    const result = await query('SELECT * FROM permissions ORDER BY permission_name');
    res.status(200).json({
      status: 'success',
      data: {
        permissions: result.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
