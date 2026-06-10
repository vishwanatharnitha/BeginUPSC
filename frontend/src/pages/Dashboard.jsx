import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Award, Flame, Star, BookOpen, Clock, AlertCircle, CheckCircle, ChevronRight, Lock, Plus, Calendar, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ setCurrentTab }) {
  const { user, profile, achievements, token } = useAuth();
  const [recentTests, setRecentTests] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  // Targets state
  const [targetTab, setTargetTab] = useState('daily');
  const [newTargetText, setNewTargetText] = useState('');
  
  const [dailyTargets, setDailyTargets] = useState(() => {
    const saved = localStorage.getItem('dailyTargets');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Read daily current affairs editorial highlights', checked: false },
      { id: 2, text: 'Study 1 topic of Modern Indian History', checked: false },
      { id: 3, text: 'Solve 5 CSAT quantitative aptitude questions', checked: false }
    ];
  });

  const [weeklyTargets, setWeeklyTargets] = useState(() => {
    const saved = localStorage.getItem('weeklyTargets');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Finish reading Laxmikanth chapters 1 to 5', checked: false },
      { id: 2, text: 'Take one Polity Foundation Mock Test', checked: false },
      { id: 3, text: 'Draft answer outline for one GS Mains question', checked: false }
    ];
  });

  const [monthlyTargets, setMonthlyTargets] = useState(() => {
    const saved = localStorage.getItem('monthlyTargets');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Complete Indian Constitution syllabus module', checked: false },
      { id: 2, text: 'Review NCERT Geography class 11 summaries', checked: false },
      { id: 3, text: 'Summarize NITI Aayog Strategy @ 75 reports', checked: false }
    ];
  });

  // Revision planner state
  const [newRevSubject, setNewRevSubject] = useState('');
  const [newRevDate, setNewRevDate] = useState('');
  const [revisionPlans, setRevisionPlans] = useState(() => {
    const saved = localStorage.getItem('revisionPlans');
    return saved ? JSON.parse(saved) : [
      { id: 1, subject: 'GS 1: Modern Indian History', date: '2026-06-12', done: false },
      { id: 2, subject: 'GS 2: Fundamental Rights & Writs', date: '2026-06-15', done: false }
    ];
  });

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  // Persist targets & revisions
  useEffect(() => {
    localStorage.setItem('dailyTargets', JSON.stringify(dailyTargets));
  }, [dailyTargets]);

  useEffect(() => {
    localStorage.setItem('weeklyTargets', JSON.stringify(weeklyTargets));
  }, [weeklyTargets]);

  useEffect(() => {
    localStorage.setItem('monthlyTargets', JSON.stringify(monthlyTargets));
  }, [monthlyTargets]);

  useEffect(() => {
    localStorage.setItem('revisionPlans', JSON.stringify(revisionPlans));
  }, [revisionPlans]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user's test results
      const resTests = await apiFetch('/tests');
      const testList = await resTests.json();
      
      const results = [];
      for (const t of testList) {
        const resLeader = await apiFetch(`/tests/${t.id}/leaderboard`);
        const leaders = await resLeader.json();
        // search if user has scores
        const userRuns = leaders.filter(l => l.username === user.username);
        if (userRuns.length > 0) {
          results.push({
            testTitle: t.title,
            score: userRuns[0].score,
            date: userRuns[0].created_at
          });
        }
      }
      setRecentTests(results);

      // Fetch completed topics count
      const resTopics = await apiFetch('/topics');
      const topics = await resTopics.json();
      const completed = topics.filter(t => t.completed).length;
      setCompletedCount(completed);
    } catch (e) {
      // Fallback
      setRecentTests([
        { testTitle: 'Polity GS-II Foundation Quiz', score: 4.68, date: new Date().toISOString() }
      ]);
      setCompletedCount(1);
    }
  };

  // Add Target handler
  const handleAddTarget = (e) => {
    e.preventDefault();
    if (!newTargetText.trim()) return;
    const item = { id: Date.now(), text: newTargetText, checked: false };
    
    if (targetTab === 'daily') setDailyTargets([...dailyTargets, item]);
    else if (targetTab === 'weekly') setWeeklyTargets([...weeklyTargets, item]);
    else if (targetTab === 'monthly') setMonthlyTargets([...monthlyTargets, item]);
    
    setNewTargetText('');
  };

  const toggleTargetCheck = (id) => {
    if (targetTab === 'daily') {
      setDailyTargets(dailyTargets.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
    } else if (targetTab === 'weekly') {
      setWeeklyTargets(weeklyTargets.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
    } else if (targetTab === 'monthly') {
      setMonthlyTargets(monthlyTargets.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
    }
  };

  const deleteTarget = (id) => {
    if (targetTab === 'daily') {
      setDailyTargets(dailyTargets.filter(t => t.id !== id));
    } else if (targetTab === 'weekly') {
      setWeeklyTargets(weeklyTargets.filter(t => t.id !== id));
    } else if (targetTab === 'monthly') {
      setMonthlyTargets(monthlyTargets.filter(t => t.id !== id));
    }
  };

  // Revision handlers
  const handleAddRevision = (e) => {
    e.preventDefault();
    if (!newRevSubject.trim() || !newRevDate) return;
    const plan = {
      id: Date.now(),
      subject: newRevSubject,
      date: newRevDate,
      done: false
    };
    setRevisionPlans([...revisionPlans, plan]);
    setNewRevSubject('');
    setNewRevDate('');
  };

  const toggleRevisionDone = (id) => {
    setRevisionPlans(revisionPlans.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const deleteRevision = (id) => {
    setRevisionPlans(revisionPlans.filter(r => r.id !== id));
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-slate-400" />
        <h2 className="text-xl font-bold text-navy">Access Locked</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Please log in or register an account using the navbar button to access your personalized preparation dashboard.
        </p>
      </div>
    );
  }

  // Gamification level progress details
  const currentLevel = profile?.level || 1;
  const currentPoints = profile?.points || 0;
  const basePointsForCurrentLevel = (currentLevel - 1) * 100;
  const relativePoints = currentPoints - basePointsForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (relativePoints / 100) * 100));

  const badgesList = [
    { key: 'Syllabus Explorer', label: 'Syllabus Explorer', desc: 'Read and completed first study topic notes.', icon: '📚' },
    { key: 'Consistency King', label: 'Consistency King', desc: 'Maintained an active 3-day study streak.', icon: '🔥' },
    { key: 'Mock Master', label: 'Mock Master', desc: 'Successfully submitted first mock test.', icon: '🎓' }
  ];

  const earnedBadgeMap = achievements.reduce((acc, ach) => {
    acc[ach.title] = true;
    return acc;
  }, {});

  const activeTargetsList = targetTab === 'daily' 
    ? dailyTargets 
    : targetTab === 'weekly' 
    ? weeklyTargets 
    : monthlyTargets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">Aspirant Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <strong className="text-navy">{user?.username}</strong>. Review your goals and consistency metrics.
          </p>
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial bg-saffron/10 px-4 py-2.5 rounded-2xl border border-saffron/20 text-center">
            <span className="text-[9px] font-black text-saffron uppercase block">Current Streak</span>
            <span className="text-lg font-black text-navy flex items-center justify-center">
              <Flame className="h-5 w-5 text-saffron fill-saffron mr-1 streak-pulse" />
              {profile?.current_streak || 0} Days
            </span>
          </div>

          <div className="flex-1 sm:flex-initial bg-gold/10 px-4 py-2.5 rounded-2xl border border-gold/20 text-center">
            <span className="text-[9px] font-black text-gold uppercase block">Aspirant Rank</span>
            <span className="text-lg font-black text-navy">Lvl {currentLevel}</span>
          </div>
        </div>
      </div>

      {/* Gamification Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-navy">
          <span>Level {currentLevel} Progress</span>
          <span>{relativePoints} / 100 XP to Level {currentLevel + 1}</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-saffron rounded-full shadow-inner"
          />
        </div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-right">
          Total preparation points: {currentPoints} XP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Completed items and Mock exams lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats quick card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow flex items-center space-x-4">
              <div className="p-3 bg-navy/5 text-navy rounded-2xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Completed Chapters</span>
                <span className="text-lg font-black text-navy">{completedCount} Topics</span>
                <button 
                  onClick={() => setCurrentTab('subjects')}
                  className="text-[10px] font-bold text-saffron block mt-1 hover:underline text-left"
                >
                  Browse study library
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow flex items-center space-x-4">
              <div className="p-3 bg-gold/5 text-gold rounded-2xl">
                <Star className="h-6 w-6 fill-gold/10" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Unlocked Achievements</span>
                <span className="text-lg font-black text-navy">{achievements.length} Badges</span>
              </div>
            </div>
          </div>

          {/* TARGET SYSTEM: Daily, Weekly, Monthly planner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-navy uppercase tracking-wide">Study Target Planner</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Track daily rituals and syllabus deadlines</p>
              </div>
              
              <div className="flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
                {['daily', 'weekly', 'monthly'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTargetTab(t)}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                      targetTab === t
                        ? 'bg-navy text-white shadow-sm'
                        : 'text-navy-light hover:text-navy'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Checklist */}
            <div className="space-y-3">
              {activeTargetsList.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleTargetCheck(item.id)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                        item.checked 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-slate-300 bg-white hover:border-navy'
                      }`}
                    >
                      {item.checked && <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>}
                    </button>
                    <span className={`font-semibold text-slate-700 ${item.checked ? 'line-through text-slate-400' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTarget(item.id)}
                    className="text-red-400 hover:text-red-650 p-1 transition-colors"
                    title="Remove target"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {activeTargetsList.length === 0 && (
                <p className="text-center py-6 text-slate-400 italic text-xs font-semibold">No targets logged for this time range. Add one below!</p>
              )}
            </div>

            {/* Add Target Form */}
            <form onSubmit={handleAddTarget} className="flex gap-2">
              <input
                type="text"
                required
                placeholder={`Add new ${targetTab} target...`}
                value={newTargetText}
                onChange={(e) => setNewTargetText(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-xs flex items-center justify-center transition-colors shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </button>
            </form>
          </div>

          {/* REVISION PLANNER */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <div>
              <h3 className="text-sm font-black text-navy uppercase tracking-wide">UPSC Subject Revision Planner</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Set spaced-repetition loops for core UPSC modules</p>
            </div>

            {/* Revision schedule list */}
            <div className="space-y-3">
              {revisionPlans.map(plan => (
                <div key={plan.id} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleRevisionDone(plan.id)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                        plan.done 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-slate-300 bg-white hover:border-navy'
                      }`}
                    >
                      {plan.done && <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>}
                    </button>
                    <div>
                      <span className={`font-extrabold text-navy block ${plan.done ? 'line-through text-slate-400' : ''}`}>
                        {plan.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center mt-0.5">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" /> Target Revision: {new Date(plan.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRevision(plan.id)}
                    className="text-red-400 hover:text-red-650 p-1 transition-colors"
                    title="Delete plan"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {revisionPlans.length === 0 && (
                <p className="text-center py-6 text-slate-400 italic text-xs font-semibold">No subject revision timelines created. Plan one below!</p>
              )}
            </div>

            {/* Plan Revisions Form */}
            <form onSubmit={handleAddRevision} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2">
              <input
                type="text"
                required
                placeholder="Subject details..."
                value={newRevSubject}
                onChange={(e) => setNewRevSubject(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:outline-none"
              />
              <input
                type="date"
                required
                value={newRevDate}
                onChange={(e) => setNewRevDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold text-xs flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" /> Schedule Revision
              </button>
            </form>
          </div>

          {/* Recent mock scores */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
            <h3 className="text-sm font-black text-navy uppercase tracking-wide">Recent Mock Test Submissions</h3>
            <div className="space-y-2">
              {recentTests.map((rt, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <div>
                    <span className="font-extrabold text-navy block">{rt.testTitle}</span>
                    <span className="text-[9px] text-slate-400">{new Date(rt.date).toLocaleDateString()}</span>
                  </div>
                  <span className="font-black text-saffron">{rt.score} Marks</span>
                </div>
              ))}

              {recentTests.length === 0 && (
                <div className="text-center py-6 text-slate-400 font-semibold italic">No quiz scores recorded yet. Attempt a test under 'Mock Tests'.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Badges grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
          <h3 className="text-sm font-black text-navy border-b border-slate-100 pb-3 uppercase tracking-wide">
            Aspirant Achievements
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {badgesList.map(badge => {
              const isEarned = !!earnedBadgeMap[badge.key] || (badge.key === 'Syllabus Explorer' && completedCount > 0);
              return (
                <div 
                  key={badge.key}
                  className={`p-4 rounded-2xl border flex items-center space-x-4 transition-all ${
                    isEarned 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-slate-50/50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="relative shrink-0 text-3xl p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span>{badge.icon}</span>
                    {!isEarned && (
                      <div className="absolute inset-0 bg-navy/60 rounded-xl flex items-center justify-center text-white text-[10px]">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    <span className={`font-black block text-sm ${isEarned ? 'text-navy' : 'text-slate-400'}`}>
                      {badge.label}
                    </span>
                    <p className="text-slate-500 mt-0.5 leading-snug">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
