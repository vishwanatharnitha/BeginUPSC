import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_URL } from '../services/api';
import { 
  ShieldAlert, Settings, Upload, CheckSquare, 
  Trash2, RefreshCw, Play, CheckCircle, Database, 
  Key, Activity, AlertCircle, Loader2, ShieldCheck
} from 'lucide-react';

export default function Admin() {
  const { user, token } = useAuth();
  
  // Tab navigation: 'dashboard' or 'diagnostics'
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // System Diagnostics States
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState('');
  const [loginTestState, setLoginTestState] = useState({ loading: false, result: null, error: '' });
  const [registerTestState, setRegisterTestState] = useState({ loading: false, result: null, error: '' });

  useEffect(() => {
    if (token && user?.role === 'admin') {
      if (activeTab === 'dashboard') {
        fetchAdminStats();
        fetchFeedback();
      } else if (activeTab === 'diagnostics') {
        fetchDiagnostics();
      }
    }
  }, [token, user, activeTab]);

  const fetchAdminStats = async () => {
    try {
      const res = await apiFetch('/admin/stats');
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
      const res = await apiFetch('/admin/feedback');
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

  const fetchDiagnostics = async () => {
    setDiagnosticsLoading(true);
    setDiagnosticsError('');
    try {
      const res = await apiFetch('/admin/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnosticsData(data);
      } else {
        const errData = await res.json();
        setDiagnosticsError(errData.message || 'Failed to fetch diagnostics information from backend.');
      }
    } catch (err) {
      setDiagnosticsError(err.message || 'Failed to connect to the backend server diagnostics endpoint.');
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const runLoginTest = async () => {
    setLoginTestState({ loading: true, result: null, error: '' });
    try {
      // Direct raw fetch to bypass apiFetch error throwing on network failures
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }
      setLoginTestState({
        loading: false,
        result: { status: res.status, ok: res.ok, data },
        error: ''
      });
    } catch (err) {
      setLoginTestState({
        loading: false,
        result: null,
        error: err.message || 'Connection failed (Failed to fetch)'
      });
    }
  };

  const runRegisterTest = async () => {
    setRegisterTestState({ loading: true, result: null, error: '' });
    try {
      // Direct raw fetch to bypass apiFetch error throwing on network failures
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }
      setRegisterTestState({
        loading: false,
        result: { status: res.status, ok: res.ok, data },
        error: ''
      });
    } catch (err) {
      setRegisterTestState({
        loading: false,
        result: null,
        error: err.message || 'Connection failed (Failed to fetch)'
      });
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/notifications', {
        method: 'POST',
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
      alert(err.message || 'Failed to publish notice.');
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/resources', {
        method: 'POST',
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
      alert(err.message || 'Failed to upload resource.');
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
      const res = await apiFetch('/admin/tests', {
        method: 'POST',
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
      alert(err.message || 'Failed to build test.');
    }
  };

  const handleResolveFeedback = async (fId) => {
    try {
      const res = await apiFetch(`/admin/feedback/${fId}`, {
        method: 'PUT'
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
      {/* Welcome & Tabs Panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 premium-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black flex items-center">
            <Settings className="h-6 w-6 mr-2 text-saffron animate-spin-slow" /> Admin Control Room
          </h1>
          <p className="text-xs text-slate-300 mt-1">Manage website uploads, review mock tests, and resolve student concerns.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-800/85 p-1 rounded-2xl border border-slate-700/60 w-fit shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-saffron text-white shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'diagnostics'
                ? 'bg-saffron text-white shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            System Diagnostics
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
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
        </>
      ) : (
        /* SYSTEM DIAGNOSTICS VIEW */
        <div className="space-y-8">
          {/* Top general connection status */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <h3 className="text-sm font-extrabold text-navy border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="h-5 w-5 text-saffron mr-2" /> Live Connection & Routing Status
              </span>
              <button 
                onClick={fetchDiagnostics} 
                disabled={diagnosticsLoading}
                className="flex items-center text-[10px] font-bold text-navy hover:text-saffron transition-all bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200"
              >
                {diagnosticsLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh Diagnostic
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frontend Configured API URL</span>
                  <span className="text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 block w-fit mt-1 text-navy select-all">
                    {API_URL}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                    *Relative routes will automatically resolve to the deployed domain on Vercel or localhost in local dev mode.
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Backend Status Check</span>
                  <div className="flex items-center mt-1.5 gap-2">
                    {diagnosticsLoading ? (
                      <span className="text-xs text-slate-400 font-semibold flex items-center">
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-saffron" /> Querying API endpoint...
                      </span>
                    ) : diagnosticsError ? (
                      <span className="text-xs text-rose-600 font-bold flex items-center bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 w-fit">
                        <ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" /> Failed to Fetch (Server Offline / CORS error)
                      </span>
                    ) : diagnosticsData ? (
                      <span className="text-xs text-emerald-700 font-extrabold flex items-center bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
                        <ShieldCheck className="h-4 w-4 mr-1.5 text-emerald-600 shrink-0 fill-emerald-100" /> Operational (Status OK)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Unknown status</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Server connection error box */}
              {diagnosticsError && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-2xl flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-rose-800">Connection Diagnosis Findings:</h4>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                      {diagnosticsError}
                    </p>
                    <p className="text-[10px] text-rose-500 mt-2">
                      Please ensure your backend server is active at {API_URL} and your local server port is bound, or ensure the environmental variables (`ALLOWED_ORIGINS` / `PORT`) are configured on Vercel.
                    </p>
                  </div>
                </div>
              )}

              {diagnosticsData && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-extrabold text-navy uppercase tracking-wider text-[10px]">Diagnostics General Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                    <div>Server Response Time:</div>
                    <div className="font-semibold text-navy text-right">{new Date(diagnosticsData.timestamp).toLocaleTimeString()}</div>
                    
                    <div>Environment Host:</div>
                    <div className="font-semibold text-navy text-right">{diagnosticsData.envValidation.VERCEL}</div>
                    
                    <div>Auth Status Check:</div>
                    <div className="font-semibold text-emerald-600 text-right">{diagnosticsData.authServiceStatus.toUpperCase()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Database diagnostic check */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
              <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2 flex items-center">
                <Database className="h-4.5 w-4.5 mr-2 text-saffron" /> Database Integrity Status
              </h3>
              
              {!diagnosticsData ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  {diagnosticsLoading ? 'Querying database status...' : 'System status diagnostics required.'}
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Database System:</span>
                    <span className="font-extrabold text-navy capitalize bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {diagnosticsData.database.type}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Connection Status:</span>
                    <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded ${
                      diagnosticsData.database.status === 'connected' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {diagnosticsData.database.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Users Table Exists:</span>
                    <span className={`font-bold ${diagnosticsData.database.userTableExists ? 'text-green-600' : 'text-red-500'}`}>
                      {diagnosticsData.database.userTableExists ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Production Data Seeded:</span>
                    <span className="font-bold text-navy">
                      {diagnosticsData.database.seededSubjectCount} Subjects Seeded
                    </span>
                  </div>

                  {diagnosticsData.database.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-rose-700 text-[10px] leading-relaxed">
                      <strong>Query Error:</strong> {diagnosticsData.database.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Env Variable configurations */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
              <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2 flex items-center">
                <Key className="h-4.5 w-4.5 mr-2 text-saffron" /> Environment Configurations
              </h3>

              {!diagnosticsData ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  {diagnosticsLoading ? 'Querying variables status...' : 'System status diagnostics required.'}
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-1.5 uppercase tracking-wide">
                    <span>Variable Key</span>
                    <span className="text-right">Configuration Status</span>
                  </div>

                  {Object.entries(diagnosticsData.envValidation).map(([key, status]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-slate-50 text-xs">
                      <span className="font-mono text-slate-600 font-semibold">{key}</span>
                      <span className={`font-bold ${
                        status.includes('Missing') || status.includes('not set')
                          ? 'text-amber-500'
                          : 'text-navy'
                      }`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Endpoint Tests */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2 flex items-center">
              <Settings className="h-4.5 w-4.5 mr-2 text-saffron" /> API Auth Endpoints Diagnostic Tests
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Login test card */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">Login Endpoint Test (`/auth/login`)</h4>
                  <button 
                    onClick={runLoginTest}
                    disabled={loginTestState.loading}
                    className="flex items-center text-[10px] font-bold text-white bg-navy hover:bg-navy-dark px-3 py-1.5 rounded-lg border shadow-sm transition-all"
                  >
                    {loginTestState.loading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1 fill-white" />
                    )}
                    Run Endpoint Check
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2 text-xs min-h-[120px] flex flex-col justify-center">
                  {loginTestState.loading ? (
                    <div className="text-center text-slate-400">Sending validation test request to backend...</div>
                  ) : loginTestState.error ? (
                    <div className="text-rose-600 font-bold space-y-1">
                      <div className="flex items-center"><ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" /> Connectivity Error</div>
                      <div className="text-[10px] font-semibold text-rose-500 leading-normal">{loginTestState.error}</div>
                    </div>
                  ) : loginTestState.result ? (
                    <div className="space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                        <span>HTTP Status Code:</span>
                        <span className={`font-bold ${loginTestState.result.status === 400 ? 'text-amber-600' : 'text-red-500'}`}>
                          {loginTestState.result.status} {loginTestState.result.ok ? '(OK)' : '(Expected Error / Payload Missing)'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 block">Server JSON Response Body:</span>
                        <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto text-[9px] max-h-[100px] overflow-y-auto leading-normal">
                          {JSON.stringify(loginTestState.result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 italic font-medium">Click button to verify auth routing and CORS credentials handshake.</div>
                  )}
                </div>
              </div>

              {/* Register test card */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">Register Endpoint Test (`/auth/register`)</h4>
                  <button 
                    onClick={runRegisterTest}
                    disabled={registerTestState.loading}
                    className="flex items-center text-[10px] font-bold text-white bg-navy hover:bg-navy-dark px-3 py-1.5 rounded-lg border shadow-sm transition-all"
                  >
                    {registerTestState.loading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1 fill-white" />
                    )}
                    Run Endpoint Check
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2 text-xs min-h-[120px] flex flex-col justify-center">
                  {registerTestState.loading ? (
                    <div className="text-center text-slate-400">Sending validation test request to backend...</div>
                  ) : registerTestState.error ? (
                    <div className="text-rose-600 font-bold space-y-1">
                      <div className="flex items-center"><ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" /> Connectivity Error</div>
                      <div className="text-[10px] font-semibold text-rose-500 leading-normal">{registerTestState.error}</div>
                    </div>
                  ) : registerTestState.result ? (
                    <div className="space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                        <span>HTTP Status Code:</span>
                        <span className={`font-bold ${registerTestState.result.status === 400 ? 'text-amber-600' : 'text-red-500'}`}>
                          {registerTestState.result.status} {registerTestState.result.ok ? '(OK)' : '(Expected Error / Payload Missing)'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 block">Server JSON Response Body:</span>
                        <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto text-[9px] max-h-[100px] overflow-y-auto leading-normal">
                          {JSON.stringify(registerTestState.result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 italic font-medium">Click button to verify auth routing and CORS credentials handshake.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
