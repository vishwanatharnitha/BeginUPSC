const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const testCount = await db.query('SELECT COUNT(*) as count FROM tests');
    const resultCount = await db.query('SELECT COUNT(*) as count FROM results');
    const feedbackCount = await db.query('SELECT COUNT(*) as count FROM feedback WHERE status = "pending"');
    const postCount = await db.query('SELECT COUNT(*) as count FROM forum_posts');

    res.json({
      students: userCount[0]?.count || 0,
      tests: testCount[0]?.count || 0,
      submissions: resultCount[0]?.count || 0,
      pendingFeedback: feedbackCount[0]?.count || 0,
      forumPosts: postCount[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving system stats', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.username, u.email, u.role, u.created_at, 
              p.points, p.level, p.current_streak 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id`
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

exports.addResource = async (req, res) => {
  const { title, category, pdfUrl } = req.body;
  if (!title || !category || !pdfUrl) {
    return res.status(400).json({ message: 'Please specify title, category, and pdfUrl.' });
  }

  try {
    await db.query(
      'INSERT INTO resources (title, category, pdf_url) VALUES (?, ?, ?)',
      [title, category, pdfUrl]
    );
    res.status(201).json({ message: 'Resource added successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding resource', error: err.message });
  }
};

exports.addTest = async (req, res) => {
  const { title, category, durationMinutes, totalMarks, questions } = req.body;

  if (!title || !category || !durationMinutes || !totalMarks || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Please provide valid test details and questions array.' });
  }

  try {
    const testResult = await db.query(
      'INSERT INTO tests (title, category, duration_minutes, total_marks) VALUES (?, ?, ?, ?)',
      [title, category, durationMinutes, totalMarks]
    );
    const testId = testResult.insertId;

    for (const q of questions) {
      await db.query(
        `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [testId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption, q.explanation]
      );
    }

    res.status(201).json({ message: 'Mock Test and all associated questions uploaded successfully.', testId });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading test details', error: err.message });
  }
};

exports.postNotification = async (req, res) => {
  const { title, message, targetRole } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }

  try {
    await db.query(
      'INSERT INTO notifications (title, message, target_role) VALUES (?, ?, ?)',
      [title, message, targetRole || 'all']
    );
    res.status(201).json({ message: 'Notification published successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating notification', error: err.message });
  }
};

exports.addCurrentAffairs = async (req, res) => {
  const { title, category, content, publishedDate, pdfUrl } = req.body;
  if (!title || !category || !content || !publishedDate) {
    return res.status(400).json({ message: 'Missing fields for current affairs post.' });
  }

  try {
    await db.query(
      'INSERT INTO current_affairs (title, category, content, published_date, pdf_url) VALUES (?, ?, ?, ?, ?)',
      [title, category, content, publishedDate, pdfUrl || null]
    );
    res.status(201).json({ message: 'Current affairs article posted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error posting current affairs', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    await db.query('DELETE FROM forum_posts WHERE id = ?', [postId]);
    res.json({ message: 'Forum post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting forum post', error: err.message });
  }
};

exports.resolveFeedback = async (req, res) => {
  const feedbackId = req.params.id;
  try {
    await db.query('UPDATE feedback SET status = "reviewed" WHERE id = ?', [feedbackId]);
    res.json({ message: 'Feedback marked as reviewed.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resolving feedback', error: err.message });
  }
};
