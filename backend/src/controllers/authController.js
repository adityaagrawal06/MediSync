const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { email, password, full_name, phone, date_of_birth } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ detail: "Email, password, and full_name are required" });
    }

    const [existingUsers] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO user (email, hashed_password, full_name, phone, date_of_birth) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, full_name, phone || null, date_of_birth || null]
    );

    const [newUserRows] = await db.execute('SELECT * FROM user WHERE id = ?', [result.insertId]);
    const newUser = newUserRows[0];
    delete newUser.hashed_password;

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    // support both JSON and form-data/urlencoded
    const email = req.body.username || req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ detail: "Username/email and password are required" });
    }

    const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ detail: 'Incorrect email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Incorrect email or password' });
    }

    const token = jwt.sign(
      { sub: user.email, id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    delete user.hashed_password;

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
