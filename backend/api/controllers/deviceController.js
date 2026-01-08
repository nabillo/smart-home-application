import { query, pool } from '../../db/index.js';

export const getDevicesInHome = async (req, res) => {
    const { homeId } = req.params;
    try {
        const result = await query('SELECT * FROM devices WHERE home_id = $1 ORDER BY name', [homeId]);
        res.status(200).json({ status: 'success', data: { devices: result.rows } });
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDevice = async (req, res) => {
    const { deviceId } = req.params;
    try {
        const deviceQuery = `
            SELECT
                d.device_id,
                d.name as device_name,
                json_build_object('room_id', r.room_id, 'name', r.name, 'icon', r.icon) as room,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'type_id', ft.functionality_type_id,
                            'type_name', ft.name,
                            'parameters', df.configured_parameters
                        )
                    )
                    FROM device_functionalities df
                    JOIN functionality_types ft ON df.functionality_type_id = ft.functionality_type_id
                    WHERE df.device_id = d.device_id),
                    '[]'::json
                ) as functionalities,
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
                    WHERE hp.home_id = d.home_id),
                    '[]'::json
                ) as home_parameters
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            WHERE d.device_id = $1
        `;
        const result = await query(deviceQuery, [deviceId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Device not found.' });
        }
        
        const row = result.rows[0];

        // Compose the final configuration
        const finalConfiguration = {};
        
        // 1. Apply home-level parameters first
        row.home_parameters.forEach(paramSet => {
            Object.assign(finalConfiguration, paramSet.parameters);
        });

        // 2. Apply device-level functionalities, overwriting any conflicts
        row.functionalities.forEach(func => {
            Object.assign(finalConfiguration, func.parameters);
        });

        const responseJson = {
            device_id: row.device_id,
            name: row.device_name,
            room: row.room.room_id ? row.room : null,
            functionalities: row.functionalities,
            home_parameters: row.home_parameters,
            final_configuration: finalConfiguration
        };

        res.status(200).json({ status: 'success', data: { device: responseJson } });
    } catch (error) {
        console.error('Error fetching device details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDevice = async (req, res) => {
    const { homeId } = req.params;
    const { name, room_id, functionalities = [] } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Device name is required.' });
    }
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const deviceResult = await client.query(
            `INSERT INTO devices (home_id, room_id, name)
             VALUES ($1, $2, $3) RETURNING device_id`,
            [homeId, room_id, name]
        );
        const deviceId = deviceResult.rows[0].device_id;

        if (functionalities.length > 0) {
            const functionalityInserts = functionalities.map(f =>
                client.query(
                    `INSERT INTO device_functionalities (device_id, functionality_type_id, configured_parameters)
                     VALUES ($1, $2, $3)`,
                    [deviceId, f.functionality_type_id, f.configured_parameters]
                )
            );
            await Promise.all(functionalityInserts);
        }

        await client.query('COMMIT');
        res.status(201).json({ status: 'success', data: { device_id: deviceId } });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating device:', error);
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ message: 'A device with this name already exists in this home.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

export const updateDevice = async (req, res) => {
    const { deviceId } = req.params;
    const { name, room_id } = req.body;

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (name !== undefined) {
        fields.push(`name = $${queryIndex++}`);
        values.push(name);
    }
    if (room_id !== undefined) {
        fields.push(`room_id = $${queryIndex++}`);
        values.push(room_id);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
    }

    values.push(deviceId);

    const updateQuery = `UPDATE devices SET ${fields.join(', ')} WHERE device_id = $${queryIndex} RETURNING *`;

    try {
        const result = await query(updateQuery, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Device not found.' });
        }
        res.status(200).json({ status: 'success', data: { device: result.rows[0] } });
    } catch (error) {
        console.error('Error updating device:', error);
        if (error.code === '23505') { // unique_violation
            return res.status(409).json({ message: 'A device with this name already exists in this home.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const deleteDevice = async (req, res) => {
    const { deviceId } = req.params;
    try {
        const result = await query('DELETE FROM devices WHERE device_id = $1', [deviceId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Device not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
