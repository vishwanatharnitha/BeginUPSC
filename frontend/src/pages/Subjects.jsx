import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, FileText, ChevronRight, HelpCircle, Lock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Subjects() {
  const { token, API_URL, refreshUserData } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // XP notification state
  const [showXpAlert, setShowXpAlert] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject.id);
    }
  }, [selectedSubject, token]); // Re-fetch when token updates (sign in/out)

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/subjects`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0]);
        }
      }
    } catch (e) {
      // Offline fallback subjects
      const mockSubs = [
        { id: 1, name: 'History', description: 'Indian Freedom Struggle, Ancient, Medieval, Modern History', category: 'both' },
        { id: 2, name: 'Polity', description: 'Indian Constitution, Governance, Political System', category: 'both' },
        { id: 3, name: 'Geography', description: 'Physical, Economic, and Social Geography of India & World', category: 'both' },
        { id: 4, name: 'Economy', description: 'National income, budgets, economic indices, infrastructure', category: 'both' }
      ];
      setSubjects(mockSubs);
      setSelectedSubject(mockSubs[0]);
    }
  };

  const fetchTopics = async (subjectId) => {
    setLoading(true);
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}/topics?subjectId=${subjectId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
        if (data.length > 0) {
          setActiveTopic(data[0]);
        } else {
          setActiveTopic(null);
        }
      }
    } catch (e) {
      // Fallback topics
      const mockTopics = [
        {
          id: 10,
          subject_id: subjectId,
          name: 'Understanding standard syllabus foundations',
          description: 'Introduction to key study sources, strategy, and marks structure.',
          notes_text: '<h3>UPSC CSE Subject Foundations</h3><p>To master any subject, you must begin with Class 6-12 NCERTs. Keep your syllabus copy adjacent to your textbook. Focus on previous year question trends. Read daily newspaper editorials (The Hindu or Indian Express) to link core concepts with dynamic news.</p>',
          completed: false
        },
        {
          id: 11,
          subject_id: subjectId,
          name: 'Core Concepts & Terminology',
          description: 'Basic standard terms and analysis notes.',
          notes_text: '<h3>Core Concepts Analysis</h3><p>Prepare micro-notes for each chapter. Avoid writing full sentences; instead, use bullet points, keywords, and flowcharts. Focus on linkages between chapters (e.g., how geographical terrain impacts historical empires or economic trade lines).</p>',
          completed: false
        }
      ];
      setTopics(mockTopics);
      setActiveTopic(mockTopics[0]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgress = async (topicId, currentStatus) => {
    if (!token) {
      alert('Please log in or register to track your progress and earn XP points!');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/topics/${topicId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (res.ok) {
        // Toggle client state
        setTopics(topics.map(t => t.id === topicId ? { ...t, completed: !currentStatus } : t));
        if (activeTopic && activeTopic.id === topicId) {
          setActiveTopic({ ...activeTopic, completed: !currentStatus });
        }

        if (!currentStatus) {
          // Gained XP!
          setShowXpAlert(true);
          setTimeout(() => setShowXpAlert(false), 2500);
        }
        refreshUserData(); // refresh streaks and badges
      }
    } catch (err) {
      console.error('Progress toggle failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      {/* XP Toast Alert */}
      <AnimatePresence>
        {showXpAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-10 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-green-500/20"
          >
            <Award className="h-5 w-5 mr-2" />
            +20 XP Points Earned!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Subject Library & Study Material</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Read comprehensive study notes, view mindmaps, and trace your UPSC syllabus completion progress chapter-by-chapter.
        </p>
      </div>

      {/* Subject catalog Grid */}
      <div className="flex flex-wrap gap-2.5 justify-center">
        {subjects.map(sub => (
          <button
            key={sub.id}
            onClick={() => {
              setSelectedSubject(sub);
              setSearchQuery('');
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
              selectedSubject?.id === sub.id
                ? 'bg-navy text-white border-navy shadow-md'
                : 'bg-white text-navy border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <input
          type="text"
          placeholder="Search chapters or study topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-navy focus:border-navy focus:outline-none"
        />
      </div>

      {/* Subject and Topics Display */}
      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Left list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4 lg:col-span-1 h-fit">
            <h3 className="font-extrabold text-navy text-sm border-b border-slate-100 pb-2">
              Topics in {selectedSubject.name}
            </h3>

            {loading ? (
              <div className="text-slate-400 py-6 text-xs text-center font-bold">Loading subject topics...</div>
            ) : (
              <div className="space-y-2">
                {topics.filter(t => 
                  t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.description.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTopic(t)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition-all ${
                      activeTopic?.id === t.id
                        ? 'border-saffron bg-saffron/5 font-extrabold'
                        : 'border-slate-100 hover:bg-slate-50 font-semibold text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mr-2">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProgress(t.id, t.completed);
                        }}
                        className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center cursor-pointer ${
                          t.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-slate-300 hover:border-navy bg-white'
                        }`}
                        title={token ? "Mark completed" : "Login to track progress"}
                      >
                        {t.completed ? (
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        ) : !token ? (
                          <Lock className="h-2.5 w-2.5 text-slate-300" />
                        ) : null}
                      </div>
                      <span className="truncate max-w-[150px]">{t.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </button>
                ))}

                {topics.filter(t => 
                  t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  t.description.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <p className="text-slate-400 text-xs italic py-6 text-center">No topics matching your query.</p>
                )}
              </div>
            )}
          </div>

          {/* Topics Notes/Mindmaps Details Panel */}
          <div className="lg:col-span-2">
            {activeTopic ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-navy">{activeTopic.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">{activeTopic.description}</p>
                  </div>
                  
                  {/* Toggle completion on reader */}
                  <button
                    onClick={() => toggleProgress(activeTopic.id, activeTopic.completed)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center space-x-1.5 ${
                      activeTopic.completed
                        ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        : 'bg-slate-50 text-navy-light border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle className={`h-4 w-4 ${activeTopic.completed ? 'text-green-500' : 'text-slate-400'}`} />
                    <span>{activeTopic.completed ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>

                {/* Notes Text (HTML render) */}
                <div 
                  className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: activeTopic.notes_text || '<p>No study notes uploaded for this topic.</p>' }}
                />

                {/* Material Downloads */}
                <div className="border-t border-slate-100 pt-6 mt-8">
                  <h4 className="font-extrabold text-navy text-xs mb-3">Topic Study Resources</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a 
                      href={activeTopic.pdf_url || '#'} 
                      onClick={(e) => { if(!activeTopic.pdf_url) e.preventDefault(); }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-saffron" />
                        <span className="font-bold text-navy">Chapter Reference PDF</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Download</span>
                    </a>

                    <a 
                      href={activeTopic.mind_map_url || '#'} 
                      onClick={(e) => { if(!activeTopic.mind_map_url) e.preventDefault(); }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gold" />
                        <span className="font-bold text-navy">Topic Mind Map</span>
                      </div>
                      <span className="text-[10px] text-slate-400">View Map</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold">Select a topic from the sidebar catalog to begin reading notes.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
