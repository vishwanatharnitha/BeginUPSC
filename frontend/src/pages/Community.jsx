import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, CornerDownRight, User, PlusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Community() {
  const { token, API_URL, refreshUserData, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Post forms state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState('Strategy');
  const [commentContent, setCommentContent] = useState('');

  // Edit post states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('Strategy');

  const categories = [
    { id: '', label: 'All Discussions' },
    { id: 'Strategy', label: 'Strategy' },
    { id: 'Polity', label: 'Polity' },
    { id: 'History', label: 'History' },
    { id: 'Optional', label: 'Optional Subject' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [category, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/forum/posts?category=${category}&search=${searchQuery}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      // Local fallback threads
      setPosts([
        { id: 1, title: 'How to select Optional Subject for Mains?', category: 'Optional', username: 'Karan_UPSC', level: 3, comment_count: 2, created_at: '2026-06-08T12:00:00.000Z', content: 'I am confused between Sociology and Public Administration. My graduation background is in engineering. Can anyone suggest how to decide?' },
        { id: 2, title: 'Recommended booklist for Economy GS3', category: 'Strategy', username: 'Shreya_Aspirant', level: 5, comment_count: 1, created_at: '2026-06-09T03:30:00.000Z', content: 'Is Ramesh Singh book sufficient for covering dynamic topics or should I strictly refer to Mrunal Patel lectures?' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (post) => {
    try {
      const res = await fetch(`${API_URL}/forum/posts/${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data.post);
        setComments(data.comments);
        setEditTitle(data.post.title);
        setEditContent(data.post.content);
        setEditCategory(data.post.category);
      }
    } catch (e) {
      // Offline fallback
      setSelectedPost(post);
      setEditTitle(post.title);
      setEditContent(post.content);
      setEditCategory(post.category);
      if (post.id === 1) {
        setComments([
          { id: 501, username: 'Polity_Mentor', level: 12, content: 'Choose the optional that you find interesting. Read the syllabus of both subjects. Sociology is relatively compact, while PubAd has significant overlap with GS Paper II.', created_at: '2026-06-08T14:30:00.000Z' },
          { id: 502, username: 'Vicky_IRS', level: 8, content: 'Sociology has smaller syllabus and is highly scoring. pubad requires dynamic updates.', created_at: '2026-06-08T15:20:00.000Z' }
        ]);
      } else {
        setComments([
          { id: 503, username: 'Economy_King', level: 6, content: 'Sanjiv Verma book is also excellent for basic frameworks. Combine it with the Union Budget and Economic Survey summaries.', created_at: '2026-06-09T04:20:00.000Z' }
        ]);
      }
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!token || !selectedPost) return;

    try {
      const res = await fetch(`${API_URL}/forum/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: editTitle, content: editContent, category: editCategory })
      });

      if (res.ok) {
        setIsEditing(false);
        fetchPostDetails(selectedPost);
        fetchPosts();
      }
    } catch (err) {
      console.error('Post edit failed:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!token || !selectedPost) return;
    if (!window.confirm('Are you sure you want to delete this thread?')) return;

    try {
      const res = await fetch(`${API_URL}/forum/posts/${selectedPost.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSelectedPost(null);
        setIsEditing(false);
        fetchPosts();
      }
    } catch (err) {
      console.error('Post deletion failed:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/forum/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content, category: postCategory })
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setShowCreateForm(false);
        fetchPosts();
        refreshUserData(); // reward XP
      }
    } catch (err) {
      console.error('Post creation failed:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token || !commentContent) return;

    try {
      const res = await fetch(`${API_URL}/forum/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: selectedPost.id, content: commentContent })
      });

      if (res.ok) {
        setCommentContent('');
        fetchPostDetails(selectedPost);
        refreshUserData(); // reward XP
      }
    } catch (err) {
      console.error('Reply failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Peer Learning Forum</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Clear your UPSC syllabus doubts, share notes summaries, and brainstorm study tips with fellow civil service aspirants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Panel: Categories, Post list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setSelectedPost(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    category === c.id
                      ? 'bg-navy text-white border-navy shadow-sm'
                      : 'bg-white text-navy border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search and Ask Doubt */}
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search forum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-navy w-full sm:w-36 font-semibold text-navy"
              />
              {token && (
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    setShowCreateForm(!showCreateForm);
                    setIsEditing(false);
                  }}
                  className="px-4 py-1.5 bg-saffron hover:bg-saffron-dark text-white rounded-lg font-bold text-[10px] flex items-center justify-center space-x-1 transition-colors shrink-0"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Ask Doubt</span>
                </button>
              )}
            </div>
          </div>

          {/* Doubt Creator Form */}
          {showCreateForm && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4">
              <h3 className="font-extrabold text-navy text-sm">Ask your doubt</h3>
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Title of your doubt..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                  <div>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                    >
                      <option value="Strategy">Strategy</option>
                      <option value="Polity">Polity</option>
                      <option value="History">History</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    required
                    rows="4"
                    placeholder="Elaborate your study concern in detail..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Submit Question (+15 XP)
                </button>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold text-xs">Loading forum threads...</div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => {
                    setShowCreateForm(false);
                    fetchPostDetails(post);
                  }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 premium-card premium-shadow space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="px-2 py-0.5 bg-saffron text-white rounded-full font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <div className="flex items-center text-slate-400 font-semibold">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span>{post.username} (Lvl {post.level || 1})</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-navy text-sm sm:text-base hover:text-saffron transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-bold">
                    <span>Published: {new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      {post.comment_count} Replies
                    </span>
                  </div>
                </div>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs italic">No discussions found in this category.</div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Active Thread/replies detailing */}
        <div className="space-y-6">
          {selectedPost ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-6">
              {/* Thread Creator OP Details */}
              {isEditing ? (
                <form onSubmit={handleEditPost} className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">Edit Title</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">Edit Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-navy"
                    >
                      <option value="Strategy">Strategy</option>
                      <option value="Polity">Polity</option>
                      <option value="History">History</option>
                      <option value="Optional">Optional</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">Edit Content</label>
                    <textarea
                      required
                      rows="4"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="px-4 py-1.5 bg-navy text-white text-[10px] font-bold rounded-lg hover:bg-navy-dark">
                      Save
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-slate-100 text-navy text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 pb-4 border-b border-slate-200">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-white px-2 py-0.5 bg-saffron rounded-full uppercase tracking-wider">
                      {selectedPost.category}
                    </span>
                    {user && (selectedPost.user_id === user.id || user.role === 'admin') && (
                      <div className="flex space-x-2 text-[10px] font-bold">
                        <button onClick={() => setIsEditing(true)} className="text-navy hover:text-saffron">Edit</button>
                        <button onClick={handleDeletePost} className="text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-navy text-base">{selectedPost.title}</h3>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    By {selectedPost.username} (Lvl {selectedPost.level || 1})
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">{selectedPost.content}</p>
                </div>
              )}

              {/* Comments responses list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                <h4 className="text-xs font-black text-navy uppercase tracking-wide">Responses</h4>
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2 items-start text-xs p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                    <CornerDownRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-navy block mb-1">
                        {c.username} <span className="text-[9px] text-slate-400 font-semibold">(Lvl {c.level || 1})</span>
                      </span>
                      <p className="text-slate-600 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-slate-400 text-xs italic py-2">No answers posted yet. Be the first to answer!</p>
                )}
              </div>

              {/* Reply Form */}
              {token ? (
                <form onSubmit={handleAddComment} className="space-y-3 border-t border-slate-100 pt-4">
                  <textarea
                    required
                    rows="3"
                    placeholder="Write your answer / solution..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold text-[10px] transition-colors"
                  >
                    Post Answer (+5 XP)
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-slate-400 font-medium">
                  <AlertCircle className="h-4 w-4 text-saffron shrink-0" />
                  <span>Log in to join discussions and post answers.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 h-fit">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-xs font-semibold">Select a thread discussion card to view answers and join debates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
