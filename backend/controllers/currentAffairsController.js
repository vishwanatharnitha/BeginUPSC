const db = require('../config/db');

exports.getCurrentAffairs = async (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM current_affairs';
  const params = [];
  const conditions = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY published_date DESC, id DESC';

  try {
    const articles = await db.query(sql, params);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving current affairs', error: err.message });
  }
};

exports.getMonthlyCompilations = async (req, res) => {
  try {
    // Return structured list of downloadable PDF resources seeded or mock files
    const compilations = [
      { id: 1, month: 'May 2026', title: 'BeginUPSC Current Affairs Digest - May 2026', downloadUrl: '/current_affairs/may_2026.pdf', size: '4.8 MB' },
      { id: 2, month: 'April 2026', title: 'BeginUPSC Current Affairs Digest - April 2026', downloadUrl: '/current_affairs/april_2026.pdf', size: '5.2 MB' },
      { id: 3, month: 'March 2026', title: 'BeginUPSC Current Affairs Digest - March 2026', downloadUrl: '/current_affairs/march_2026.pdf', size: '4.9 MB' }
    ];
    res.json(compilations);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving compilations', error: err.message });
  }
};
