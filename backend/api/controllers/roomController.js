import { query } from '../../db/index.js';

export const getRoomsInHome = async (req, res) => {
    const { homeId } = req.params;
    try {
        const result = await query('SELECT * FROM rooms WHERE home_id = $1 ORDER BY name', [homeId]);
        res.status(200).json({ status: 'success', data: { rooms: result.rows } });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createRoom = async (req, res) => {
    const { homeId } = req.params;
    const { name, icon } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Room name is required.' });
    }
    try {
        const newRoom = await query(
            'INSERT INTO rooms (home_id, name, icon) VALUES ($1, $2, $3) RETURNING *',
            [homeId, name, icon]
        );
        res.status(201).json({ status: 'success', data: { room: newRoom.rows[0] } });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateRoom = async (req, res) => {
    const { roomId } = req.params;
    const { name, icon } = req.body;
    try {
        const result = await query(
            'UPDATE rooms SET name = $1, icon = $2 WHERE room_id = $3 RETURNING *',
            [name, icon, roomId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Room not found.' });
        }
        res.status(200).json({ status: 'success', data: { room: result.rows[0] } });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const result = await query('DELETE FROM rooms WHERE room_id = $1', [roomId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Room not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
