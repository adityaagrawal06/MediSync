const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.generateQRToken = async (req, res) => {
  try {
    const { expires_in_minutes, access_type, allowed_sections, selected_report_ids } = req.body;
    const patient_id = req.user.id;

    const token = uuidv4();
    const expires_at = new Date(Date.now() + expires_in_minutes * 60000);

    const [result] = await db.execute(
      `INSERT INTO qrtoken (token, patient_id, access_type, allowed_sections, selected_report_ids, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [token, patient_id, access_type, allowed_sections, selected_report_ids || null, expires_at]
    );

    const [tokens] = await db.execute('SELECT * FROM qrtoken WHERE id = ?', [result.insertId]);
    res.status(201).json(tokens[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getSharedRecord = async (req, res) => {
  try {
    const { token } = req.params;

    const [tokens] = await db.execute('SELECT * FROM qrtoken WHERE token = ?', [token]);
    if (tokens.length === 0) {
      return res.status(404).json({ detail: 'Shared record not found' });
    }

    const qrToken = tokens[0];
    if (new Date() > new Date(qrToken.expires_at)) {
      return res.status(410).json({ detail: 'Shared record has expired' });
    }

    const [patients] = await db.execute('SELECT * FROM user WHERE id = ?', [qrToken.patient_id]);
    if (patients.length === 0) {
      return res.status(404).json({ detail: 'Patient not found' });
    }
    const patient = patients[0];

    const allowedSections = qrToken.allowed_sections ? qrToken.allowed_sections.split(',') : [];

    const responseData = {
      full_name: patient.full_name,
      expires_at: qrToken.expires_at,
      allowed_sections: allowedSections,
      profile: null,
      visits: [],
      unlinked_reports: []
    };

    let profileData = {};
    let hasProfileData = false;

    if (allowedSections.includes('biometrics')) {
      hasProfileData = true;
      Object.assign(profileData, { age: patient.age, sex: patient.sex, blood_group: patient.blood_group, height: patient.height, weight: patient.weight });
    }
    if (allowedSections.includes('vitals')) {
      hasProfileData = true;
      Object.assign(profileData, { hr: patient.hr, bp: patient.bp, resp_rate: patient.resp_rate, spo2: patient.spo2 });
    }
    if (allowedSections.includes('lifestyle')) {
      hasProfileData = true;
      Object.assign(profileData, { steps_goal: patient.steps_goal, sleep_goal: patient.sleep_goal, activity_level: patient.activity_level, water_intake_goal: patient.water_intake_goal });
    }
    if (allowedSections.includes('history')) {
      hasProfileData = true;
      Object.assign(profileData, { primary_concerns: patient.primary_concerns, family_history: patient.family_history });
    }

    if (hasProfileData) {
      responseData.profile = profileData;
    }

    if (allowedSections.includes('records')) {
      const selectedIds = qrToken.selected_report_ids ? qrToken.selected_report_ids.split(',').map(id => parseInt(id, 10)) : [];
      
      const [visits] = await db.execute('SELECT * FROM visit WHERE patient_id = ? ORDER BY date DESC', [patient.id]);
      const [allReports] = await db.execute('SELECT * FROM report WHERE patient_id = ?', [patient.id]);

      const filteredVisits = [];
      for (const visit of visits) {
        const visitReports = allReports.filter(r => r.visit_id === visit.id);
        const filteredReports = selectedIds.length > 0 ? visitReports.filter(r => selectedIds.includes(r.id)) : visitReports;
        
        if (selectedIds.length === 0 || filteredReports.length > 0) {
          visit.reports = filteredReports;
          filteredVisits.push(visit);
        }
      }
      responseData.visits = filteredVisits;

      const unlinkedReports = allReports.filter(r => r.visit_id === null);
      const filteredUnlinked = selectedIds.length > 0 ? unlinkedReports.filter(r => selectedIds.includes(r.id)) : unlinkedReports;
      responseData.unlinked_reports = filteredUnlinked;
    }

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.createVisitFromSharedToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { doctor_name, hospital_name, examine_area, location, date, diagnosis, notes } = req.body;

    const [tokens] = await db.execute('SELECT * FROM qrtoken WHERE token = ?', [token]);
    if (tokens.length === 0) {
      return res.status(404).json({ detail: 'Shared record not found' });
    }

    const qrToken = tokens[0];
    if (new Date() > new Date(qrToken.expires_at)) {
      return res.status(410).json({ detail: 'Shared record has expired' });
    }

    const visitDate = date ? new Date(date) : new Date();

    const [result] = await db.execute(
      `INSERT INTO visit (patient_id, doctor_name, hospital_name, examine_area, location, date, diagnosis, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [qrToken.patient_id, doctor_name || null, hospital_name || null, examine_area || null, location || null, visitDate, diagnosis || null, notes || null]
    );

    const [visits] = await db.execute('SELECT * FROM visit WHERE id = ?', [result.insertId]);
    res.status(201).json(visits[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.validateQRToken = async (req, res) => {
  try {
    const { token } = req.body;

    const [tokens] = await db.execute('SELECT * FROM qrtoken WHERE token = ?', [token]);
    if (tokens.length === 0) {
      return res.status(404).json({ detail: 'QR token not found' });
    }

    const qrToken = tokens[0];
    if (qrToken.used_at) {
      return res.status(410).json({ detail: 'QR token already used' });
    }
    if (new Date() > new Date(qrToken.expires_at)) {
      return res.status(410).json({ detail: 'QR token expired' });
    }

    res.json(qrToken);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
