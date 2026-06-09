const db = require('../config/db');

exports.getTests = async (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM tests';
  const params = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  try {
    const tests = await db.query(sql, params);
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tests', error: err.message });
  }
};

exports.getTestQuestions = async (req, res) => {
  const testId = req.params.id;
  try {
    const testResult = await db.query('SELECT * FROM tests WHERE id = ?', [testId]);
    if (testResult.length === 0) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    // Return questions (hide correct_option if needed, but for local mock let's include it so it's fully self-contained, or only return on submit).
    // Let's include options and question text, keeping correct answers hidden or only returning them so the client can show instantly. Let's return correct_option and explanation for immediate feedback review!
    const questions = await db.query('SELECT * FROM questions WHERE test_id = ?', [testId]);
    res.json({
      test: testResult[0],
      questions
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
};

exports.submitTest = async (req, res) => {
  const testId = req.params.id;
  const userId = req.user.id;
  const { answers } = req.body; // Map of { questionId: selectedOption }

  if (!answers) {
    return res.status(400).json({ message: 'Please provide test answers.' });
  }

  try {
    const testResult = await db.query('SELECT * FROM tests WHERE id = ?', [testId]);
    if (testResult.length === 0) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    const questions = await db.query('SELECT * FROM questions WHERE test_id = ?', [testId]);
    
    let correctCount = 0;
    let incorrectCount = 0;
    let totalScore = 0;

    // Standard marking: Correct +2, Incorrect -0.66 (one-third negative marking)
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected) {
        if (selected.toUpperCase() === q.correct_option.toUpperCase()) {
          correctCount++;
          totalScore += 2;
        } else {
          incorrectCount++;
          totalScore -= 0.66;
        }
      }
    });

    // Ensure score is rounded nicely
    totalScore = parseFloat(totalScore.toFixed(2));

    // Calculate mock rank prediction
    // Rank = number of results on this test with higher score + 1
    const rankings = await db.query('SELECT COUNT(*) as higher FROM results WHERE test_id = ? AND score > ?', [testId, totalScore]);
    const rank = (rankings[0].higher || 0) + 1;

    // Save result
    await db.query(
      'INSERT INTO results (user_id, test_id, score, correct_answers, incorrect_answers, rank_prediction) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, testId, totalScore, correctCount, incorrectCount, rank]
    );

    // Award XP/points (+50 points for attempting mock test)
    const profileResult = await db.query('SELECT points, level FROM profiles WHERE user_id = ?', [userId]);
    let newLevel = 1;
    let newPoints = 0;
    if (profileResult.length > 0) {
      newPoints = profileResult[0].points + 50;
      newLevel = Math.floor(newPoints / 100) + 1;
      await db.query('UPDATE profiles SET points = ?, level = ? WHERE user_id = ?', [newPoints, newLevel, userId]);
    }

    // Check achievement unlock
    const quizCountResult = await db.query('SELECT COUNT(*) as testCount FROM results WHERE user_id = ?', [userId]);
    const testCount = quizCountResult[0].testCount || 0;
    if (testCount >= 1) {
      const achExists = await db.query('SELECT * FROM achievements WHERE user_id = ? AND title = ?', [userId, 'Mock Master']);
      if (achExists.length === 0) {
        await db.query('INSERT INTO achievements (user_id, title, description, badge_icon) VALUES (?, ?, ?, ?)', [
          userId,
          'Mock Master',
          'Completed first mock test on BeginUPSC',
          '🎓'
        ]);
      }
    }

    res.json({
      score: totalScore,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      rankPrediction: rank,
      totalQuestions: questions.length,
      levelUp: newLevel > (profileResult[0]?.level || 1),
      newPoints
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting test', error: err.message });
  }
};

exports.getTestLeaderboard = async (req, res) => {
  const testId = req.params.id;
  try {
    const leaderboard = await db.query(
      `SELECT r.score, r.created_at, u.username, p.level 
       FROM results r 
       JOIN users u ON r.user_id = u.id 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE r.test_id = ? 
       ORDER BY r.score DESC, r.created_at ASC 
       LIMIT 10`,
      [testId]
    );
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving leaderboard', error: err.message });
  }
};

exports.getAttempts = async (req, res) => {
  const userId = req.user.id;
  try {
    const attempts = await db.query(
      `SELECT r.*, t.title as test_title, t.category as test_category 
       FROM results r 
       JOIN tests t ON r.test_id = t.id 
       WHERE r.user_id = ? 
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving attempts', error: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  const userId = req.user.id;
  try {
    const summary = await db.query(
      `SELECT COUNT(*) as total_tests, 
              AVG(score) as average_score,
              SUM(correct_answers) as total_correct,
              SUM(incorrect_answers) as total_incorrect
       FROM results 
       WHERE user_id = ?`,
      [userId]
    );

    const subjectAnalysis = await db.query(
      `SELECT s.name as subject_name,
              COUNT(r.id) as tests_taken,
              AVG(r.score) as avg_score,
              SUM(r.correct_answers) as total_correct,
              SUM(r.incorrect_answers) as total_incorrect
       FROM results r
       JOIN tests t ON r.test_id = t.id
       JOIN subjects s ON t.subject_id = s.id
       WHERE r.user_id = ?
       GROUP BY s.id`,
      [userId]
    );

    res.json({
      summary: summary[0] || { total_tests: 0, average_score: 0, total_correct: 0, total_incorrect: 0 },
      subjectAnalysis
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving analytics', error: err.message });
  }
};
