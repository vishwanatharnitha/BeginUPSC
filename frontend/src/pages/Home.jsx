import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { BookOpen, CheckCircle, ArrowRight, ShieldCheck, HelpCircle, Trophy, Bell, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home({ setCurrentTab }) {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ students: 12450, tests: 45, submissions: 8200 });

  useEffect(() => {
    fetchNotifications();
    fetchSystemStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      // Offline fallback
      setNotifications([
        { id: 1, title: 'UPSC CSE 2026 Notification Released', message: 'The official UPSC CSE 2026 notification is out. Apply before the scheduled deadline.' },
        { id: 2, title: 'Mock Test Platform Live!', message: 'You can now take topic tests and full length prelims tests with 1/3rd negative marking.' }
      ]);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const res = await apiFetch('/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      // Local fallback
    }
  };

  const quotes = [
    "Your focus should be on path, not the destination. Enjoy the struggle.",
    "The civil services are not just a job; they are an opportunity to transform lives.",
    "Believe in yourself, stay disciplined, and consistency will take care of the rest.",
    "Hard work beats talent when talent doesn't work hard. Keep studying!"
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative gradient-navy text-white py-20 px-4 sm:px-6 lg:px-8 rounded-b-[40px] overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-saffron/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-gold/10 blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-extrabold text-saffron bg-saffron/15 border border-saffron/20 px-4 py-1.5 rounded-full uppercase tracking-widest"
          >
            100% Free UPSC Coaching Alternative
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight"
          >
            {t('heroTitle')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <button
              onClick={() => setCurrentTab('subjects')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-saffron hover:bg-saffron-dark text-white font-bold text-base transition-all duration-300 shadow-lg shadow-saffron/30 hover:scale-105 flex items-center justify-center"
            >
              {t('startLearning')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button
              onClick={() => setCurrentTab('eligibility')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-base transition-all duration-300 flex items-center justify-center"
            >
              {t('checkEligibility')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. SUCCESS STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white border border-slate-200 rounded-3xl p-8 premium-shadow">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black text-navy">{stats.students}+</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Aspirants</p>
          </div>
          <div className="text-center space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0">
            <h3 className="text-3xl font-black text-saffron">Rs. 0</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Coaching Fees</p>
          </div>
          <div className="text-center space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0">
            <h3 className="text-3xl font-black text-gold">100%</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syllabus Covered</p>
          </div>
          <div className="text-center space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0">
            <h3 className="text-3xl font-black text-navy">{stats.submissions || 3420}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quizzes Attempted</p>
          </div>
        </div>
      </section>

      {/* 3. LATEST NOTIFICATIONS / HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications Board */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-navy flex items-center">
                <Bell className="h-5 w-5 mr-2 text-saffron" />
                Latest UPSC Notifications
              </h3>
              <span className="h-2 w-2 rounded-full bg-red-500 streak-pulse" />
            </div>
            
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-sm">
                  <h4 className="font-extrabold text-navy mb-1">{n.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-xs">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-6">No current notifications.</p>
              )}
            </div>
          </div>

          {/* Daily Motivation Box */}
          <div className="bg-saffron/10 border border-saffron/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-saffron/20 blur-xl pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center space-x-2 text-saffron">
                <Flame className="h-6 w-6" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Aspirant Fuel</span>
              </div>
              <h3 className="text-lg font-black text-navy leading-snug">Daily UPSC Motivation</h3>
              <p className="text-sm text-navy-light italic leading-relaxed">
                "{quotes[new Date().getDay() % quotes.length]}"
              </p>
            </div>
            <div className="border-t border-saffron/20 pt-4 mt-6 text-xs text-saffron font-bold">
              Stay honest. Stay disciplined. Believe in yourself.
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY BEGINUPSC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">Why Choose BeginUPSC?</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            We solve the biggest roadblocks encountered by students, providing premium, coaching-grade features free of cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 premium-card premium-shadow space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg text-navy">Zero Cost Education</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No hidden subscriptions, no locking contents behind paywalls. Every note, PDF, roadmap, and test is completely free.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 premium-card premium-shadow space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center text-saffron">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg text-navy">Gamified Journey</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your streaks, gain XP, earn badges, and levels. Keep yourself motivated and consistent throughout the long preparation cycle.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 premium-card premium-shadow space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg text-navy">One-Stop Platform</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No more searching across dozens of websites. NCERTs, daily affairs, mock test papers, strategies, and a chatbot helper are in one tab.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ROADMAP TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-navy tracking-tight">The UPSC Preparation Timeline</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            From absolute zero to Civil Services officer. Here is how your preparation lifecycle evolves.
          </p>
        </div>

        <div className="relative border-l border-slate-200 max-w-3xl mx-auto text-left pl-6 space-y-10">
          <div className="relative">
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-navy border-4 border-white" />
            <h4 className="font-bold text-navy">Month 1-3: Foundations & NCERTs</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Understand the UPSC syllabus, pattern, and criteria. Read basic Class 6 to 12 NCERTs for History, Geography, Polity, and Economics. Use the eligibility checker to confirm attempts.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-saffron border-4 border-white" />
            <h4 className="font-bold text-navy">Month 4-8: Core Subjects & Current Affairs</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Move to standard reference books (Laxmikanth, Spectrum). Read daily newspapers, review monthly PDF current affairs digests, and track topic completions.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-gold border-4 border-white" />
            <h4 className="font-bold text-navy">Month 9-12: Mock Quizzes & Revisions</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Solve mock tests with exact UPSC timers and negative markings. Practice previous year question (PYQ) keys, write optional answers, and verify scores.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center space-y-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-saffron/10 via-transparent to-transparent pointer-events-none" />
        
        <h2 className="text-3xl font-extrabold tracking-tight">Aspirant Stories & Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-sm italic text-slate-300 leading-relaxed">
              "Before finding BeginUPSC, I was overwhelmed and confused about where to start. The Beginner Guide and Eligibility checker clarified all my doubts instantly. Having free downloadable NCERTs and subject trackers saved me thousands."
            </p>
            <div>
              <span className="font-bold text-white block text-sm">Aman Preet Singh</span>
              <span className="text-xs text-saffron font-semibold">Working Professional - Delhi</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-sm italic text-slate-300 leading-relaxed">
              "The Mock Test portal is outstanding! The negative marking logic is identical to UPSC Prelims, and the rank checker keeps me competitive. The gamified streaks tracker keeps me focused every day."
            </p>
            <div>
              <span className="font-bold text-white block text-sm">Pooja Mishra</span>
              <span className="text-xs text-saffron font-semibold">Full-Time Aspirant - Lucknow</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
