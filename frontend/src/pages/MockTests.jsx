import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Clock, ShieldAlert, Award, ArrowRight, HelpCircle, Check, X, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MockTests() {
  const { token, refreshUserData } = useAuth();
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [testActive, setTestActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Exam taking state
  const [answers, setAnswers] = useState({}); // { questionId: 'A' }
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [testResult, setTestResult] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);

  // Tabs and Analytics state
  const [activeTab, setActiveTab] = useState('tests');
  const [attempts, setAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (activeTab === 'attempts' && token) {
      fetchAttempts();
    } else if (activeTab === 'analytics' && token) {
      fetchAnalytics();
    }
  }, [activeTab, token]);

  const fetchAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const res = await apiFetch('/tests/attempts');
      if (res.ok) {
        const data = await res.json();
        setAttempts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await apiFetch('/tests/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchLeaderboard = async (testId) => {
    try {
      const res = await apiFetch(`/tests/${testId}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Countdown timer hook
  useEffect(() => {
    if (!testActive || timeLeft <= 0) {
      if (testActive && timeLeft === 0) {
        handleSubmitTest();
      }
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, testActive]);

  const fetchTests = async () => {
    try {
      const res = await apiFetch('/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (e) {
      // Fallback tests
      setTests([
        { id: 1, title: 'Polity Basics & Fundamental Rights Mock', category: 'topic', duration_minutes: 15, total_marks: 10 },
        { id: 2, title: 'History & Indian National Congress Full Mock', category: 'subject', duration_minutes: 20, total_marks: 20 }
      ]);
    }
  };

  const startTest = async (test) => {
    if (!token) {
      alert('Please login or register to participate in UPSC Mock Exams.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiFetch(`/tests/${test.id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTest(data.test);
        setQuestions(data.questions);
        setAnswers({});
        setTimeLeft(data.test.duration_minutes * 60);
        setTestResult(null);
        setReviewMode(false);
        setTestActive(true);
      }
    } catch (e) {
      // Local fallback questions
      setActiveTest(test);
      setQuestions([
        {
          id: 101,
          question_text: 'Which constitutional body conducts examinations for the appointment of All India Services?',
          option_a: 'NITI Aayog',
          option_b: 'Union Public Service Commission',
          option_c: 'Staff Selection Commission',
          option_d: 'Election Commission',
          correct_option: 'B',
          explanation: 'Article 315 of the Indian Constitution directs the establishment of a Union Public Service Commission (UPSC) for conducting examinations.'
        },
        {
          id: 102,
          question_text: 'Who was the President of the Indian National Congress during the 1907 Surat Split?',
          option_a: 'Rash Behari Ghosh',
          option_b: 'Bal Gangadhar Tilak',
          option_c: 'Gopal Krishna Gokhale',
          option_d: 'Dadabhai Naoroji',
          correct_option: 'A',
          explanation: 'The Congress split into Moderates and Extremists during the Surat session of 1907, presided by Dr. Rash Behari Ghosh.'
        }
      ]);
      setAnswers({});
      setTimeLeft(test.duration_minutes * 60);
      setTestResult(null);
      setReviewMode(false);
      setTestActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, option) => {
    setAnswers({
      ...answers,
      [qId]: option
    });
  };

  const handleSubmitTest = async () => {
    setTestActive(false);
    setLoading(true);
    try {
      const res = await apiFetch(`/tests/${activeTest.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
        fetchLeaderboard(activeTest.id);
        refreshUserData();
      }
    } catch (e) {
      // Local mock evaluation
      let correct = 0;
      let incorrect = 0;
      let score = 0;
      
      questions.forEach(q => {
        const ans = answers[q.id];
        if (ans) {
          if (ans.toUpperCase() === q.correct_option.toUpperCase()) {
            correct++;
            score += 2;
          } else {
            incorrect++;
            score -= 0.66;
          }
        }
      });
      score = parseFloat(score.toFixed(2));
      
      setTestResult({
        score,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        rankPrediction: 1,
        totalQuestions: questions.length,
        newPoints: 50
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. EXAM RUNNING MODE */}
      {testActive ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy">{activeTest?.title}</h2>
              <span className="text-xs text-saffron font-bold">Standard UPSC Prelims Marking Scheme (+2 / -0.66)</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl font-bold text-sm">
              <Clock className="h-5 w-5 streak-pulse" />
              <span>{formatTime(timeLeft)} Left</span>
            </div>
          </div>

          <div className="space-y-8 py-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-4">
                <p className="font-extrabold text-sm sm:text-base text-navy">
                  Q{idx + 1}. {q.question_text}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optKey = `option_${opt.toLowerCase()}`;
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`text-left p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-saffron bg-saffron/5 text-navy font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="font-black mr-2 text-saffron">{opt}.</span>
                        {q[optKey]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
              onClick={handleSubmitTest}
              className="px-8 py-3 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-sm transition-colors shadow-lg"
            >
              Submit Test Paper
            </button>
          </div>
        </div>
      ) : testResult ? (
        /* 2. RESULTS AND SOLUTIONS REVIEW PANEL */
        <div className="space-y-8">
          {/* Summary Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow text-center space-y-6">
            <div className="flex justify-center text-saffron">
              <Award className="h-16 w-16" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy">Test Results Analyzed</h2>
              <p className="text-xs text-slate-500 mt-1">UPSC Mock Submission Complete</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Final Score</span>
                <span className="text-lg font-black text-navy">{testResult.score} / {testResult.totalQuestions * 2}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Correct</span>
                <span className="text-lg font-black text-green-500">{testResult.correctAnswers}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Incorrect</span>
                <span className="text-lg font-black text-red-500">{testResult.incorrectAnswers}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Rank Prediction</span>
                <span className="text-lg font-black text-saffron">#{testResult.rankPrediction}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setReviewMode(true)}
                className="px-6 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold text-xs transition-colors"
              >
                Review Explanations & Key
              </button>
              <button
                onClick={() => {
                  setTestResult(null);
                  setActiveTest(null);
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy rounded-xl font-bold text-xs border border-slate-200 transition-colors"
              >
                Exit Test Results
              </button>
            </div>

            {/* Global Test Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="border-t border-slate-100 pt-6 mt-6 max-w-xl mx-auto space-y-4 text-left">
                <h3 className="font-extrabold text-navy text-xs uppercase tracking-wider text-center">Top Performers Leaderboard</h3>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-navy text-white p-3 font-bold">
                    <span>Rank</span>
                    <span className="col-span-2">Username</span>
                    <span className="text-right">Score</span>
                  </div>
                  {leaderboard.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-3 border-b border-slate-200 font-medium">
                      <span className="font-bold text-saffron">#{idx + 1}</span>
                      <span className="col-span-2 text-navy">{row.username} <span className="text-[10px] text-slate-400 font-semibold">(Lvl {row.level || 1})</span></span>
                      <span className="text-right font-black text-navy">{row.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Solutions list */}
          {reviewMode && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
              <h3 className="text-lg font-extrabold text-navy border-b border-slate-100 pb-2">Solutions & Explanations</h3>
              
              <div className="space-y-8">
                {questions.map((q, idx) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.correct_option;
                  return (
                    <div key={q.id} className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="font-extrabold text-sm text-navy">
                        Q{idx + 1}. {q.question_text}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const isCorrectOpt = q.correct_option === opt;
                          const isUserOpt = userAns === opt;
                          let btnStyle = 'border-slate-200 text-slate-600 bg-white';
                          if (isCorrectOpt) btnStyle = 'border-green-500 bg-green-50 text-green-700 font-bold';
                          else if (isUserOpt && !isCorrect) btnStyle = 'border-red-500 bg-red-50 text-red-700 font-bold';

                          return (
                            <div key={opt} className={`p-3 rounded-xl border flex items-center justify-between ${btnStyle}`}>
                              <span>{opt}. {q[`option_${opt.toLowerCase()}`]}</span>
                              {isCorrectOpt && <Check className="h-4 w-4 text-green-500 shrink-0 ml-2" />}
                              {isUserOpt && !isCorrect && <X className="h-4 w-4 text-red-500 shrink-0 ml-2" />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-200/60 pt-3 mt-2 text-xs">
                        <strong className="text-navy flex items-center mb-1">
                          <BookOpen className="h-4 w-4 text-saffron mr-1.5" /> Explanation
                        </strong>
                        <p className="text-slate-500 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3. DEFAULT LIST OF MOCK QUIZZES */
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-extrabold text-navy">Mock Exam Room</h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Simulate standard UPSC Prelims papers. Features negative scoring and instant rank estimations.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 gap-4 justify-center">
            {[
              { id: 'tests', label: 'Active Mock Exams' },
              { id: 'attempts', label: 'My Past Attempts' },
              { id: 'analytics', label: 'Performance Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm font-bold pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-saffron text-saffron'
                    : 'border-transparent text-slate-400 hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tests List */}
          {activeTab === 'tests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.map(test => (
                <div key={test.id} className="bg-white border border-slate-200 rounded-3xl p-6 premium-card premium-shadow flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-white px-2 py-0.5 bg-saffron rounded-full uppercase tracking-wider">
                      {test.category} Quiz
                    </span>
                    <h3 className="font-extrabold text-base text-navy">{test.title}</h3>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2 font-semibold">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-slate-400" />
                        {test.duration_minutes} Mins
                      </div>
                      <div>Marks: {test.total_marks || 20}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => startTest(test)}
                    className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Start Mock Test</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Past Attempts Tab */}
          {activeTab === 'attempts' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4">
              <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2">Your Past Submissions</h3>
              {!token ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">Please log in to view your past test attempts.</div>
              ) : loadingAttempts ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">Loading attempts history...</div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">No past attempts found. Start by taking an exam!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Test Paper</th>
                        <th className="py-2.5">Score</th>
                        <th className="py-2.5">Correct</th>
                        <th className="py-2.5">Incorrect</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-slate-600">
                      {attempts.map((att) => (
                        <tr key={att.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2.5">{new Date(att.created_at).toLocaleDateString()}</td>
                          <td className="py-2.5 text-navy font-bold">{att.test_title}</td>
                          <td className="py-2.5 text-saffron font-bold">{att.score}</td>
                          <td className="py-2.5 text-green-500">{att.correct_answers}</td>
                          <td className="py-2.5 text-red-500">{att.incorrect_answers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Performance Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {!token ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-400 font-semibold">
                  Please log in to check your performance analysis.
                </div>
              ) : loadingAnalytics ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-400 font-semibold">
                  Loading performance statistics...
                </div>
              ) : (
                <>
                  {/* Summary Analytics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tests Taken</span>
                      <span className="text-lg font-black text-navy">{analytics?.summary?.total_tests || 0}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Avg Score</span>
                      <span className="text-lg font-black text-saffron">
                        {analytics?.summary?.average_score ? parseFloat(analytics.summary.average_score).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Correct</span>
                      <span className="text-lg font-black text-green-500">{analytics?.summary?.total_correct || 0}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Incorrect</span>
                      <span className="text-lg font-black text-red-500">{analytics?.summary?.total_incorrect || 0}</span>
                    </div>
                  </div>

                  {/* Subject Wise Analysis */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow">
                    <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2 mb-4">Subject-wise Score Analysis</h3>
                    {!analytics?.subjectAnalysis || analytics.subjectAnalysis.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">No subject-wise data available yet. Attempt subject mock tests to view details.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold">
                              <th className="py-2.5">Subject</th>
                              <th className="py-2.5">Tests Attempted</th>
                              <th className="py-2.5">Average Score</th>
                              <th className="py-2.5">Accuracy Rate</th>
                            </tr>
                          </thead>
                          <tbody className="font-semibold text-slate-600">
                            {analytics.subjectAnalysis.map((row, idx) => {
                              const totalAns = row.total_correct + row.total_incorrect;
                              const accuracy = totalAns > 0 ? ((row.total_correct / totalAns) * 100).toFixed(1) + '%' : 'N/A';
                              return (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                  <td className="py-2.5 text-navy font-bold">{row.subject_name}</td>
                                  <td className="py-2.5">{row.tests_taken}</td>
                                  <td className="py-2.5 text-saffron font-bold">{parseFloat(row.avg_score).toFixed(2)}</td>
                                  <td className="py-2.5 text-navy">{accuracy}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
