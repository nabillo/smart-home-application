import { query } from '../../db/index.js';

export const getAllFunctionalityTypes = async (req, res) => {
    try {
        const result = await query('SELECT * FROM functionality_types ORDER BY name');
        res.status(200).json({
            status: 'success',
            data: {
                functionalityTypes: result.rows,
            },
        });
    } catch (error) {
        console.error('Error fetching functionality types:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
