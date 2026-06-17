const db = require('../config/db');

exports.createDoctor = async (req, res) => {
  try {
    const { name, hospital, license_number } = req.body;

    if (!name || !hospital) {
      return res.status(400).json({ detail: 'Name and hospital are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO doctor (name, hospital, license_number) VALUES (?, ?, ?)',
      [name, hospital, license_number || null]
    );

    const [doctors] = await db.execute('SELECT * FROM doctor WHERE id = ?', [result.insertId]);
    res.status(201).json(doctors[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.createVisitViaQR = async (req, res) => {
  try {
    const { qr_token, doctor_id, diagnosis, notes } = req.body;

    if (!qr_token || !doctor_id) {
      return res.status(400).json({ detail: 'qr_token and doctor_id are required' });
    }

    // Validate QR Token
    const [tokens] = await db.execute('SELECT * FROM qrtoken WHERE token = ?', [qr_token]);
    if (tokens.length === 0) {
      return res.status(404).json({ detail: 'QR token not found' });
    }
    
    const qrTokenObj = tokens[0];
    if (new Date() > new Date(qrTokenObj.expires_at)) {
      return res.status(400).json({ detail: 'QR token has expired' });
    }
    if (qrTokenObj.used_at) {
      return res.status(400).json({ detail: 'QR token has already been used' });
    }

    // Validate Doctor
    const [doctors] = await db.execute('SELECT * FROM doctor WHERE id = ?', [doctor_id]);
    if (doctors.length === 0) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Create Visit
    const [result] = await db.execute(
      'INSERT INTO visit (patient_id, doctor_id, diagnosis, notes) VALUES (?, ?, ?, ?)',
      [qrTokenObj.patient_id, doctor_id, diagnosis || null, notes || null]
    );

    // Mark Token as Used
    await db.execute('UPDATE qrtoken SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [qrTokenObj.id]);

    const [visits] = await db.execute('SELECT * FROM visit WHERE id = ?', [result.insertId]);
    res.status(201).json(visits[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
