import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Calendar, User, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Roadmaps() {
  const { token } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStrategyTab, setActiveStrategyTab] = useState('weekly');

  // Filters
  const [audience, setAudience] = useState('beginner');
  const [months, setMonths] = useState('1');

  useEffect(() => {
    fetchRoadmaps();
  }, [audience, months]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/roadmaps?audience=${audience}&months=${months}`);
      if (res.ok) {
        const data = await res.json();
        setRoadmaps(data);
        if (data.length > 0) {
          setSelectedRoadmap(data[0]);
        } else {
          setSelectedRoadmap(null);
        }
      }
    } catch (err) {
      // Offline fallback
      generateLocalRoadmaps();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalRoadmaps = () => {
    let mockContent = [];
    if (months === '1') {
      mockContent = [
        { week: 1, title: 'Understand UPSC Pattern & Syllabus', tasks: ['Read the UPSC Syllabus 3 times', 'Analyze Mains General Studies structure', 'Read NCERT Class 6 History'] },
        { week: 2, title: 'Polity Basics & Constitutional Philosophy', tasks: ['Read M. Laxmikanth Chapters 1-4', 'Study Preamble & Fundamental Rights', 'Take 1 Polity Mock quiz'] },
        { week: 3, title: 'Geography Core Concepts', tasks: ['Read NCERT Class 11 Physical Geography', 'Locate major Indian rivers on outline maps', 'Watch 2 Geography video summaries'] },
        { week: 4, title: 'Current Affairs & Consolidation', tasks: ['Read Monthly Current Affairs digest', 'Revise weekly notes', 'Attempt previous year prelims questions'] }
      ];
    } else {
      mockContent = [
        { week: 1, title: 'Subject Foundation Launch', tasks: ['Select study material for history and polity', 'Initiate daily newspaper editorial readings', 'Read NCERT Class 6 & 7 History'] },
        { week: 2, title: 'Polity Essentials', tasks: ['Analyze Laxmikanth chapters 5-10', 'Read Class 11 Indian Constitution at Work', 'Attempt basic MCQ tests'] },
        { week: 3, title: 'Economic Core & Terminology', tasks: ['Understand GDP, Inflation, Fiscal Policy basics', 'Read NCERT Class 11 Economics', 'Prepare list of standard economic indexes'] },
        { week: 4, title: 'Geography & Environment Baselines', tasks: ['Read NCERT Class 11 World Physical Geography', 'Study ecosystems, food chains, and biodiversity', 'Review daily news summaries'] }
      ];
    }

    const mockRoadmap = {
      id: 99,
      title: `${months} Month Strategy for ${audience.replace('_', ' ').toUpperCase()}`,
      duration_months: parseInt(months, 10),
      target_audience: audience,
      content_json: { weeks: mockContent }
    };

    setRoadmaps([mockRoadmap]);
    setSelectedRoadmap(mockRoadmap);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Personalized UPSC Roadmaps</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Choose a preparation plan matching your daily bandwidth and targets. Follow weekly objectives to cover the syllabus systematically.
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Audience Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Who are you?</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="beginner">Beginner / New Aspirant</option>
              <option value="college_student">College Student</option>
              <option value="working_professional">Working Professional</option>
              <option value="full_time_aspirant">Full-Time Aspirant</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Target Duration</label>
            <select
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="1">1 Month (Kickstarter)</option>
              <option value="3">3 Months (Prelims Crash)</option>
              <option value="6">6 Months (Focused Study)</option>
              <option value="12">1 Year (Full Cycle)</option>
              <option value="24">2 Years (Gradual Prep)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-bold bg-saffron/10 text-saffron px-3 py-1.5 rounded-full border border-saffron/20">
          Tailored Roadmap Configurator
        </div>
      </div>

      {/* Roadmap visualization */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold">Generating customized roadmap...</div>
      ) : selectedRoadmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6 lg:col-span-1 h-fit">
            <h3 className="text-lg font-bold text-navy border-b border-slate-100 pb-3 flex items-center">
              <Clock className="h-5 w-5 text-saffron mr-2" /> Schedule Overview
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Study Plan</span>
                <span className="text-sm font-extrabold text-navy">{selectedRoadmap.title}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Profile Target</span>
                <span className="text-xs font-bold text-saffron capitalize">{selectedRoadmap.target_audience.replace('_', ' ')}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Preparation Hours Suggestion</span>
                <span className="text-xs text-navy-light font-medium">
                  {selectedRoadmap.target_audience === 'working_professional' || selectedRoadmap.target_audience === 'college_student'
                    ? '3 - 4 Hours / day (Maximize weekends)'
                    : '8 - 10 Hours / day (Structured study)'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Strategy and Targets Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-200 gap-4 overflow-x-auto pb-2">
              {[
                { id: 'weekly', label: 'Weekly Schedule' },
                { id: 'targets', label: 'Daily & Monthly Targets' },
                { id: 'strategy', label: 'Exam Strategy' },
                { id: 'books', label: 'Booklist' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStrategyTab(tab.id)}
                  className={`text-xs font-bold pb-2 border-b-2 whitespace-nowrap transition-colors ${
                    activeStrategyTab === tab.id
                      ? 'border-saffron text-saffron'
                      : 'border-transparent text-slate-400 hover:text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Weekly Plan */}
            {activeStrategyTab === 'weekly' && (
              <div className="space-y-4">
                {selectedRoadmap.content_json?.weeks?.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-xs font-extrabold text-white px-2.5 py-1 bg-navy rounded-full uppercase tracking-wider">
                        Week {item.week}
                      </span>
                      <h4 className="font-extrabold text-sm text-navy">{item.title}</h4>
                    </div>
                    
                    <div className="space-y-2.5">
                      {item.tasks.map((task, i) => (
                        <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-600">
                          <CheckCircle className="h-4.5 w-4.5 text-saffron shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Targets */}
            {activeStrategyTab === 'targets' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Daily Targets</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedRoadmap.content_json?.daily_targets || "Spend 3-4 hours reading standard textbooks. Complete daily editorials summaries (1 hr) and attempt 5 practice questions."}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Monthly Targets</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedRoadmap.content_json?.monthly_targets || "Complete 1 full mock test paper. Summarize core chapters of standard resources. Complete monthly affairs compilation."}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Preparation Milestones</h4>
                  <div className="space-y-2.5">
                    {(selectedRoadmap.content_json?.milestones || ["Understand CSE syllabus outlines", "Complete fundamental NCERT blocks", "Score > 90 marks consistently on mock trials"]).map((mile, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-600">
                        <span className="px-1.5 py-0.5 bg-saffron/10 text-saffron font-bold rounded text-[9px]">{i + 1}</span>
                        <span className="leading-relaxed">{mile}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Strategy */}
            {activeStrategyTab === 'strategy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Subject Allocation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedRoadmap.content_json?.subject_allocation || "History & Polity (Initial month). Geography & Economy (Following block). Ethics & Science (Final revision segment)."}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Revision Strategy</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedRoadmap.content_json?.revision_strategy || "Implement 3-read revision technique. Highlighting important definitions during subsequent read cycles."}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Test Series Strategy</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedRoadmap.content_json?.test_strategy || "Solve topic-wise quizzes after every standard chapter. Attempt full-length GS papers 1-2 months before Prelims date."}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Current Affairs Strategy</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedRoadmap.content_json?.current_affairs_strategy || "Daily newspaper reading (1 hour). Rely on BeginUPSC daily editorial summary outlines."}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Books */}
            {activeStrategyTab === 'books' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4">
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Recommended Booklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(selectedRoadmap.content_json?.book_recommendations || [
                    "Indian Polity by M. Laxmikanth",
                    "A Brief History of Modern India by Spectrum",
                    "NCERT Geography Class 11 and 12",
                    "Indian Economy by Sanjiv Verma"
                  ]).map((book, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center space-x-2 text-xs">
                      <span className="text-saffron font-bold text-sm">📖</span>
                      <span className="font-bold text-navy leading-normal">{book}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 font-semibold">No study roadmap matching your selection found.</div>
      )}
    </div>
  );
}
