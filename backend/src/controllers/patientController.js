const db = require('../config/db');

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.execute('SELECT * FROM user WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const user = users[0];
    delete user.hashed_password;

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: 'No data provided to update' });
    }

    // List of allowed fields for update
    const allowedFields = [
      'date_of_birth', 'age', 'sex', 'blood_group', 'height', 'weight',
      'hr', 'bp', 'resp_rate', 'spo2', 'steps_goal', 'sleep_goal',
      'activity_level', 'water_intake_goal', 'primary_concerns', 'family_history'
    ];

    const fieldsToUpdate = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ detail: 'No valid fields provided to update' });
    }

    values.push(userId);
    const query = `UPDATE user SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

    await db.execute(query, values);

    const [updatedUsers] = await db.execute('SELECT * FROM user WHERE id = ?', [userId]);
    const updatedUser = updatedUsers[0];
    delete updatedUser.hashed_password;

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
