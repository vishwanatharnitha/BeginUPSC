import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, BarChart, Settings, Upload, CheckSquare, Plus, Trash, Trash2 } from 'lucide-react';

export default function Admin() {
  const { user, token, API_URL } = useAuth();
  
  // Dashboard Analytics
  const [stats, setStats] = useState({ students: 0, tests: 0, submissions: 0, pendingFeedback: 0 });
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states: Notice
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  
  // Form states: Resource
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('ncert');
  const [resUrl, setResUrl] = useState('');

  // Form states: Quiz Builder
  const [testTitle, setTestTitle] = useState('');
  const [testCategory, setTestCategory] = useState('topic');
  const [testDuration, setTestDuration] = useState('15');
  const [testMarks, setTestMarks] = useState('20');
  
  // Dynamic Questions array in builder
  const [questions, setQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' }
  ]);

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchAdminStats();
      fetchFeedback();
    }
  }, [token, user]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/feedback`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: noticeTitle, message: noticeMsg })
      });
      if (res.ok) {
        alert('Notice published successfully!');
        setNoticeTitle('');
        setNoticeMsg('');
        fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/resources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: resTitle, category: resCategory, pdfUrl: resUrl })
      });
      if (res.ok) {
        alert('Reference PDF uploaded successfully!');
        setResTitle('');
        setResUrl('');
        fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quiz Builder functions
  const addQuestionField = () => {
    setQuestions([
      ...questions,
      { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' }
    ]);
  };

  const updateQuestionField = (idx, key, val) => {
    const updated = [...questions];
    updated[idx][key] = val;
    setQuestions(updated);
  };

  const handleBuildTest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/tests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: testTitle,
          category: testCategory,
          durationMinutes: parseInt(testDuration, 10),
          totalMarks: parseInt(testMarks, 10),
          questions
        })
      });

      if (res.ok) {
        alert('Quiz and question keys uploaded successfully!');
        setTestTitle('');
        setQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '' }]);
        fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveFeedback = async (fId) => {
    try {
      const res = await fetch(`${API_URL}/admin/feedback/${fId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchFeedback();
        fetchAdminStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!token || user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-navy">Access Denied</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          This panel is restricted to system administrators. Please sign in with admin credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Welcome */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 premium-shadow">
        <h1 className="text-2xl font-black flex items-center">
          <Settings className="h-6 w-6 mr-2 text-saffron" /> Admin Control Room
        </h1>
        <p className="text-xs text-slate-300 mt-1">Manage website uploads, review mock tests, and resolve student concerns.</p>
      </div>

      {/* 1. TRAFFIC ANALYTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center premium-shadow">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Aspirants</span>
          <span className="text-lg font-black text-navy">{stats.students}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center premium-shadow">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Tests Uploaded</span>
          <span className="text-lg font-black text-navy">{stats.tests}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center premium-shadow">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">MCQs Logged</span>
          <span className="text-lg font-black text-navy">{stats.submissions}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center premium-shadow">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Open Feedback</span>
          <span className="text-lg font-black text-saffron">{stats.pendingFeedback}</span>
        </div>
      </div>

      {/* Forms & Feedback container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Notice */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
            <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2 flex items-center">
              <Upload className="h-4.5 w-4.5 mr-2 text-saffron" /> Publish Notice & Alert
            </h3>
            <form onSubmit={handlePublishNotice} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Alert Headline (e.g. UPSC Prelims Admit Card Out)..."
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy"
              />
              <textarea
                required
                rows="2"
                placeholder="Notice description details..."
                value={noticeMsg}
                onChange={(e) => setNoticeMsg(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy"
              />
              <button type="submit" className="px-6 py-2.5 bg-navy text-white rounded-xl font-bold text-xs">
                Publish Alert
              </button>
            </form>
          </div>

          {/* Upload Reference PDF */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
            <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2 flex items-center">
              <Upload className="h-4.5 w-4.5 mr-2 text-saffron" /> Upload Reference Syllabus & Books
            </h3>
            <form onSubmit={handleUploadResource} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Document Title (e.g. Class 7 History NCERT)..."
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy"
                />
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy"
                >
                  <option value="syllabus">UPSC Syllabus</option>
                  <option value="ncert">NCERT Books</option>
                  <option value="report">Government Report</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="PDF download path or cloud URL..."
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy"
              />
              <button type="submit" className="px-6 py-2.5 bg-navy text-white rounded-xl font-bold text-xs">
                Upload PDF Document
              </button>
            </form>
          </div>

          {/* Create Quiz Builder */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2">
              UPSC MCQ Quiz Builder
            </h3>
            
            <form onSubmit={handleBuildTest} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Exam title..."
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy"
                />
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy"
                >
                  <option value="topic">Topic Test</option>
                  <option value="subject">Subject Mock</option>
                  <option value="mock">Full Exam Paper</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={testMarks}
                    onChange={(e) => setTestMarks(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              {/* Questions Array fields */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-navy">Question Keys ({questions.length})</h4>
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="px-3 py-1 bg-saffron text-white rounded-lg font-bold text-[10px]"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between font-bold text-navy mb-2">
                      <span>Question #{idx + 1}</span>
                      {questions.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Question content text..."
                      value={q.questionText}
                      onChange={(e) => updateQuestionField(idx, 'questionText', e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Option A"
                        value={q.optionA}
                        onChange={(e) => updateQuestionField(idx, 'optionA', e.target.value)}
                        className="px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Option B"
                        value={q.optionB}
                        onChange={(e) => updateQuestionField(idx, 'optionB', e.target.value)}
                        className="px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Option C"
                        value={q.optionC}
                        onChange={(e) => updateQuestionField(idx, 'optionC', e.target.value)}
                        className="px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Option D"
                        value={q.optionD}
                        onChange={(e) => updateQuestionField(idx, 'optionD', e.target.value)}
                        className="px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Correct Option</label>
                        <select
                          value={q.correctOption}
                          onChange={(e) => updateQuestionField(idx, 'correctOption', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Explanation</label>
                        <input
                          type="text"
                          placeholder="Explanation for solutions review..."
                          value={q.explanation}
                          onChange={(e) => updateQuestionField(idx, 'explanation', e.target.value)}
                          className="w-full px-3.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-3 bg-saffron text-white rounded-xl font-bold text-xs shadow-md">
                Upload Mock Paper & Question Keys
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Student Feedback lists */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
          <h3 className="text-sm font-black text-navy border-b border-slate-100 pb-3 uppercase tracking-wide">
            Student Feedback & Ratings
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {feedback.map(feed => (
              <div key={feed.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-saffron/10 text-saffron rounded-full font-bold uppercase text-[9px]">
                    {feed.type}
                  </span>
                  <span className="text-[9px] text-slate-400">{new Date(feed.created_at).toLocaleDateString()}</span>
                </div>
                
                <p className="text-navy-light font-medium">{feed.content}</p>
                
                {feed.rating && <div className="text-gold font-bold">Rating: {feed.rating} / 5</div>}

                <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">By {feed.username || 'Guest Aspirant'}</span>
                  {feed.status === 'pending' ? (
                    <button 
                      onClick={() => handleResolveFeedback(feed.id)}
                      className="px-2 py-1 bg-green-500 text-white rounded font-bold"
                    >
                      Mark Reviewed
                    </button>
                  ) : (
                    <span className="text-green-600 font-bold flex items-center">
                      <CheckSquare className="h-3.5 w-3.5 mr-0.5" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            ))}

            {feedback.length === 0 && (
              <p className="text-slate-400 text-xs italic text-center py-6">No feedback submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
