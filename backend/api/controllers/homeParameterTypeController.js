import { query } from '../../db/index.js';

export const getAllParameterTypes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM home_parameter_types ORDER BY name');
    res.status(200).json({
      status: 'success',
      data: { homeParameterTypes: result.rows },
    });
  } catch (error) {
    console.error('Error fetching home parameter types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
