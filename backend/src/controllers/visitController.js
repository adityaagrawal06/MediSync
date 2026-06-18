const db = require('../config/db');

exports.createVisit = async (req, res) => {
  try {
    const { doctor_id, diagnosis, notes, examine_area, location } = req.body;
    const patient_id = req.user.id;

    let doctor_name = null;
    let hospital_name = null;

    if (doctor_id) {
      const [doctors] = await db.execute('SELECT * FROM doctor WHERE id = ?', [doctor_id]);
      if (doctors.length > 0) {
        doctor_name = doctors[0].name;
        hospital_name = doctors[0].hospital;
      }
    }

    const [result] = await db.execute(
      `INSERT INTO visit (patient_id, doctor_id, doctor_name, hospital_name, examine_area, location, diagnosis, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id || null, doctor_name, hospital_name, examine_area || null, location || null, diagnosis || null, notes || null]
    );

    const [visits] = await db.execute('SELECT * FROM visit WHERE id = ?', [result.insertId]);
    res.status(201).json(visits[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getVisits = async (req, res) => {
  try {
    const patient_id = req.user.id;
    const [visits] = await db.execute('SELECT * FROM visit WHERE patient_id = ? ORDER BY date DESC', [patient_id]);
    res.json(visits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const patient_id = req.user.id;
    
    const [visits] = await db.execute('SELECT * FROM visit WHERE id = ? AND patient_id = ?', [id, patient_id]);
    if (visits.length === 0) {
      return res.status(404).json({ detail: 'Visit not found' });
    }

    const visit = visits[0];
    const [prescriptions] = await db.execute('SELECT * FROM prescription WHERE visit_id = ?', [id]);
    const [medications] = await db.execute('SELECT * FROM medication WHERE visit_id = ?', [id]);
    const [reports] = await db.execute('SELECT * FROM report WHERE visit_id = ?', [id]);

    visit.prescriptions = prescriptions;
    visit.medications = medications;
    visit.reports = reports;

    res.json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicine_name, dosage, frequency, duration, instructions } = req.body;

    const [result] = await db.execute(
      `INSERT INTO prescription (visit_id, medicine_name, dosage, frequency, duration, instructions) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, medicine_name, dosage, frequency, duration, instructions || null]
    );

    const [prescriptions] = await db.execute('SELECT * FROM prescription WHERE id = ?', [result.insertId]);
    res.status(201).json(prescriptions[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.addMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicine_name, dosage, frequency, start_date, end_date } = req.body;

    const [result] = await db.execute(
      `INSERT INTO medication (visit_id, medicine_name, dosage, frequency, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, medicine_name, dosage, frequency, start_date, end_date || null]
    );

    const [medications] = await db.execute('SELECT * FROM medication WHERE id = ?', [result.insertId]);
    res.status(201).json(medications[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.uploadReport = async (req, res) => {
  try {
    const { id } = req.params; // visit_id
    const patient_id = req.user.id;
    const { document_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    const file_url = `/uploads/${file.filename}`;

    const [result] = await db.execute(
      `INSERT INTO report (visit_id, patient_id, file_name, file_type, file_url, document_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, patient_id, file.originalname, file.mimetype, file_url, document_type || 'diagnostic']
    );

    const [reports] = await db.execute('SELECT * FROM report WHERE id = ?', [result.insertId]);
    res.status(201).json(reports[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
