const db = require('../config/db');

exports.getRoadmaps = async (req, res) => {
  const { audience, months } = req.query;
  let sql = 'SELECT * FROM roadmaps';
  const params = [];

  const conditions = [];
  if (audience) {
    conditions.push('target_audience = ?');
    params.push(audience);
  }
  if (months) {
    conditions.push('duration_months = ?');
    params.push(months);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const roadmaps = await db.query(sql, params);
    
    // Parse content_json if database returned it as string
    const parsedRoadmaps = roadmaps.map(r => {
      try {
        if (typeof r.content_json === 'string') {
          r.content_json = JSON.parse(r.content_json);
        }
      } catch (e) {
        // Leave as is
      }
      return r;
    });

    res.json(parsedRoadmaps);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving roadmaps', error: err.message });
  }
};

exports.getRoadmapById = async (req, res) => {
  try {
    const roadmap = await db.query('SELECT * FROM roadmaps WHERE id = ?', [req.params.id]);
    if (roadmap.length === 0) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }

    const item = roadmap[0];
    try {
      if (typeof item.content_json === 'string') {
        item.content_json = JSON.parse(item.content_json);
      }
    } catch (e) {
      // Leave as is
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roadmap details', error: err.message });
  }
};
