const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password.' });
  }

  try {
    // Check if user exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'student';

    // Insert user
    const insertUserResult = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, userRole]
    );
    const userId = insertUserResult.insertId;

    // Create profile
    await db.query(
      'INSERT INTO profiles (user_id, full_name, age, category, nationality, graduation_status, points, level, current_streak, last_active_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, null, 'general', 'Indian', 'completed', 0, 1, 0, null]
    );

    // Fetch newly created user and profile
    const userResult = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [userId]);
    const user = userResult[0];

    const token = generateToken(user);
    res.status(201).json({
      user,
      profile: { points: 0, level: 1, current_streak: 0, category: 'general', nationality: 'Indian' },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter both email and password.' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = userResult[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const profileResult = await db.query('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
    const profile = profileResult[0] || {};

    const token = generateToken(user);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      profile,
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [req.user.id]);
    const profileResult = await db.query('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    const achievementsResult = await db.query('SELECT * FROM achievements WHERE user_id = ?', [req.user.id]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      user: userResult[0],
      profile: profileResult[0] || {},
      achievements: achievementsResult
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile', error: err.message });
  }
};

exports.updateStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileResult = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    if (profileResult.length === 0) return res.status(404).json({ message: 'Profile not found' });

    const profile = profileResult[0];
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.current_streak;
    let newPoints = profile.points + 10; // add XP points
    let newLevel = profile.level;

    if (profile.last_active_date) {
      const lastDate = new Date(profile.last_active_date);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Level calculation (e.g. level = floor(points/100) + 1)
    newLevel = Math.floor(newPoints / 100) + 1;

    await db.query(
      'UPDATE profiles SET current_streak = ?, points = ?, level = ?, last_active_date = ? WHERE user_id = ?',
      [newStreak, newPoints, newLevel, today, userId]
    );

    // Check if new achievement unlocked
    if (newStreak === 3) {
      const achExists = await db.query('SELECT * FROM achievements WHERE user_id = ? AND title = ?', [userId, 'Consistency King']);
      if (achExists.length === 0) {
        await db.query('INSERT INTO achievements (user_id, title, description, badge_icon) VALUES (?, ?, ?, ?)', [
          userId,
          'Consistency King',
          'Maintained a 3-day study streak',
          '🔥'
        ]);
      }
    }

    res.json({
      message: 'Streak updated successfully',
      profile: {
        ...profile,
        current_streak: newStreak,
        points: newPoints,
        level: newLevel,
        last_active_date: today
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update streak', error: err.message });
  }
};
