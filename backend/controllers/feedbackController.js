const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
  const { type, content, rating } = req.body;
  const userId = req.user ? req.user.id : null; // optional login

  if (!type || !content) {
    return res.status(400).json({ message: 'Type and content are required for feedback.' });
  }

  try {
    await db.query(
      'INSERT INTO feedback (user_id, type, content, rating, status) VALUES (?, ?, ?, ?, ?)',
      [userId, type, content, rating || null, 'pending']
    );

    res.status(201).json({ message: 'Feedback submitted successfully. Thank you for helping us improve BeginUPSC!' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await db.query(
      `SELECT f.*, u.username, u.email 
       FROM feedback f 
       LEFT JOIN users u ON f.user_id = u.id 
       ORDER BY f.created_at DESC`
    );
    res.json(feedbackList);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving feedback list', error: err.message });
  }
};
