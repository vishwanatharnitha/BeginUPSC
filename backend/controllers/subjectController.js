const db = require('../config/db');

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await db.query('SELECT * FROM subjects');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving subjects', error: err.message });
  }
};

exports.getTopics = async (req, res) => {
  const { subjectId } = req.query;
  const userId = req.user ? req.user.id : null;

  try {
    let sql = 'SELECT t.* FROM topics t';
    const params = [];

    if (subjectId) {
      sql += ' WHERE t.subject_id = ?';
      params.push(subjectId);
    }

    const topics = await db.query(sql, params);

    // If userId exists, fetch completion status for each topic
    if (userId) {
      const completions = await db.query('SELECT topic_id, completed FROM progress WHERE user_id = ?', [userId]);
      const completionMap = completions.reduce((acc, c) => {
        acc[c.topic_id] = c.completed === 1 || c.completed === true || c.completed === '1';
        return acc;
      }, {});

      const updatedTopics = topics.map(t => ({
        ...t,
        completed: !!completionMap[t.id]
      }));
      return res.json(updatedTopics);
    }

    res.json(topics.map(t => ({ ...t, completed: false })));
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving topics', error: err.message });
  }
};

exports.toggleTopicProgress = async (req, res) => {
  const topicId = req.params.id;
  const userId = req.user.id;
  const { completed } = req.body; // boolean

  if (completed === undefined) {
    return res.status(400).json({ message: 'Please provide completed value (true/false).' });
  }

  try {
    // Check if topic exists
    const topicResult = await db.query('SELECT * FROM topics WHERE id = ?', [topicId]);
    if (topicResult.length === 0) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    const val = completed ? 1 : 0;

    // UPSERT progress using raw query (works in MySQL and SQLite)
    const exists = await db.query('SELECT * FROM progress WHERE user_id = ? AND topic_id = ?', [userId, topicId]);
    if (exists.length > 0) {
      await db.query('UPDATE progress SET completed = ? WHERE user_id = ? AND topic_id = ?', [val, userId, topicId]);
    } else {
      await db.query('INSERT INTO progress (user_id, topic_id, completed) VALUES (?, ?, ?)', [userId, topicId, val]);
    }

    // Award XP/points for completion
    if (completed) {
      const profileResult = await db.query('SELECT points, level FROM profiles WHERE user_id = ?', [userId]);
      if (profileResult.length > 0) {
        const points = profileResult[0].points + 20; // 20 XP per topic completed
        const level = Math.floor(points / 100) + 1;
        await db.query('UPDATE profiles SET points = ?, level = ? WHERE user_id = ?', [points, level, userId]);
      }
    }

    res.json({ message: 'Progress updated successfully.', completed });
  } catch (err) {
    res.status(500).json({ message: 'Error updating topic progress', error: err.message });
  }
};
