import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Trophy, Award, MessageSquare, Play, Calendar } from 'lucide-react';

export default function Motivation() {
  const { token, profile, updateStreak } = useAuth();
  const [studyHours, setStudyHours] = useState('');
  const [logs, setLogs] = useState([
    { date: '2026-06-08', hours: 6 },
    { date: '2026-06-07', hours: 7 }
  ]);

  const handleLogHours = (e) => {
    e.preventDefault();
    if (!studyHours || parseFloat(studyHours) <= 0) return;
    const newLog = {
      date: new Date().toISOString().split('T')[0],
      hours: parseFloat(studyHours)
    };
    setLogs([newLog, ...logs]);
    setStudyHours('');
    
    // Auto update streak on backend
    if (token) {
      updateStreak();
    }
  };

  const stories = [
    { id: 1, name: 'Ananya Reddy (AIR 3, 2023)', strategy: 'Ananya Reddy focused on core geography notes, consistent newspaper revisions, and limited optional references to avoid cognitive overload.', quote: 'Select minimum resources and revise them maximum times.' },
    { id: 2, name: 'Kanishak Kataria (AIR 1, 2018)', strategy: 'Kanishak highlighted the importance of mock tests, math analytical focus, and rigorous self-discipline.', quote: 'Mock tests teach you what not to mark in the actual exam.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Consistency & Motivation Center</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Log daily study efforts, keep active learning streaks alive, and learn directly from strategies shared by top civil service rank holders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Middle: Consistency Streaks and Logger */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <h3 className="text-lg font-bold text-navy border-b border-slate-100 pb-3 flex items-center">
              <Flame className="h-5 w-5 text-saffron mr-2 streak-pulse fill-saffron" />
              Daily consistency Logger
            </h3>

            {token ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-3 bg-saffron/10 p-5 rounded-2xl border border-saffron/20 text-center sm:text-left">
                  <span className="text-[10px] font-black text-saffron uppercase block">Active Streak</span>
                  <h4 className="text-3xl font-black text-navy">{profile?.current_streak || 0} Days Study Streak!</h4>
                  <p className="text-xs text-navy-light leading-relaxed">
                    Log your daily hours or read notes to maintain your streak and avoid reset.
                  </p>
                  <button 
                    onClick={updateStreak}
                    className="mt-2 px-6 py-2 bg-saffron text-white hover:bg-saffron-dark rounded-xl font-bold text-xs transition-all shadow shadow-saffron/20"
                  >
                    Confirm Today's Study
                  </button>
                </div>

                <form onSubmit={handleLogHours} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Study Hours Worked Today</label>
                    <input
                      type="number"
                      required
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      placeholder="e.g. 6"
                      min="0.5"
                      max="24"
                      step="0.5"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy focus:border-navy"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    Save Study Entry
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-6">
                Please login to access the Streak tracker, award achievements, and log study times.
              </p>
            )}
          </div>

          {/* Previous Log entries */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
            <h4 className="text-sm font-black text-navy uppercase tracking-wide">Recent Study Logs</h4>
            <div className="space-y-2">
              {logs.map((l, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <span className="font-semibold text-navy-light flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" /> {l.date}
                  </span>
                  <span className="font-bold text-navy">{l.hours} Hours studied</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Topper quotes and interviews */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6 h-fit">
          <h3 className="text-sm font-black text-navy border-b border-slate-100 pb-3 uppercase tracking-wide flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-gold fill-gold/10" /> Topper Insights
          </h3>

          <div className="space-y-6">
            {stories.map(story => (
              <div key={story.id} className="space-y-2 text-xs">
                <span className="font-black text-navy block text-sm">{story.name}</span>
                <p className="text-slate-600 leading-relaxed italic">"{story.quote}"</p>
                <p className="text-slate-500 leading-relaxed font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                  {story.strategy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
