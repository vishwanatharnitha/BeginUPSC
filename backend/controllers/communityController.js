const db = require('../config/db');

exports.getPosts = async (req, res) => {
  const { category, search } = req.query;
  let sql = `SELECT f.*, u.username, p.level, 
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = f.id) as comment_count
             FROM forum_posts f 
             JOIN users u ON f.user_id = u.id 
             LEFT JOIN profiles p ON u.id = p.user_id`;
  const params = [];
  const conditions = [];

  if (category) {
    conditions.push('f.category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(f.title LIKE ? OR f.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY f.created_at DESC';

  try {
    const posts = await db.query(sql, params);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving posts', error: err.message });
  }
};

exports.getPostDetails = async (req, res) => {
  const postId = req.params.id;
  try {
    const postResult = await db.query(
      `SELECT f.*, u.username, p.level 
       FROM forum_posts f 
       JOIN users u ON f.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.id = ?`,
      [postId]
    );

    if (postResult.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comments = await db.query(
      `SELECT c.*, u.username, p.level 
       FROM comments c 
       JOIN users u ON c.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE c.post_id = ? 
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json({
      post: postResult[0],
      comments
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving post details', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { title, content, category } = req.body;
  const userId = req.user.id;

  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Title, content, and category are required.' });
  }

  try {
    const insertResult = await db.query(
      'INSERT INTO forum_posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
      [userId, title, content, category]
    );

    // Reward active participation (+15 XP points for starting a discussion)
    const profileResult = await db.query('SELECT points, level FROM profiles WHERE user_id = ?', [userId]);
    if (profileResult.length > 0) {
      const points = profileResult[0].points + 15;
      const level = Math.floor(points / 100) + 1;
      await db.query('UPDATE profiles SET points = ?, level = ? WHERE user_id = ?', [points, level, userId]);
    }

    res.status(201).json({ message: 'Post created successfully.', postId: insertResult.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Title, content, and category are required.' });
  }

  try {
    const post = await db.query('SELECT * FROM forum_posts WHERE id = ?', [postId]);
    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post[0].user_id !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post.' });
    }

    await db.query(
      'UPDATE forum_posts SET title = ?, content = ?, category = ? WHERE id = ?',
      [title, content, category, postId]
    );

    res.json({ message: 'Post updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const post = await db.query('SELECT * FROM forum_posts WHERE id = ?', [postId]);
    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post[0].user_id !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    await db.query('DELETE FROM forum_posts WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
};

exports.createComment = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user.id;

  if (!postId || !content) {
    return res.status(400).json({ message: 'PostId and comment content are required.' });
  }

  try {
    const postExists = await db.query('SELECT * FROM forum_posts WHERE id = ?', [postId]);
    if (postExists.length === 0) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    // Reward XP (+5 points for writing a reply)
    const profileResult = await db.query('SELECT points, level FROM profiles WHERE user_id = ?', [userId]);
    if (profileResult.length > 0) {
      const points = profileResult[0].points + 5;
      const level = Math.floor(points / 100) + 1;
      await db.query('UPDATE profiles SET points = ?, level = ? WHERE user_id = ?', [points, level, userId]);
    }

    res.status(201).json({ message: 'Comment added successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting comment', error: err.message });
  }
};
