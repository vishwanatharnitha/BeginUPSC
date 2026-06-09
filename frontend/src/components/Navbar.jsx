import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Award, Flame, User, Globe, LogOut, Menu, X, ShieldAlert, Loader2, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, profile, login, register, logout, token } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Client-side validations
    if (isRegisterMode && !username.trim()) {
      setAuthError('Name is required.');
      showToast('Name is required.', 'error');
      return;
    }

    if (!email.trim()) {
      setAuthError('Email is required.');
      showToast('Email is required.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid email address.');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!password) {
      setAuthError('Password is required.');
      showToast('Password is required.', 'error');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(username, email, password, role);
        showToast('Registration successful! Welcome.', 'success');
        setCurrentTab('dashboard');
      } else {
        await login(email, password);
        showToast('Successfully signed in!', 'success');
        setCurrentTab('dashboard');
      }
      setShowAuthModal(false);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const errMsg = err.message || 'Authentication failed.';
      setAuthError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'guide', label: t('guide') },
    { id: 'eligibility', label: t('eligibility') },
    { id: 'roadmaps', label: t('roadmaps') },
    { id: 'subjects', label: t('subjects') },
    { id: 'pyqs', label: t('pyqs') },
    { id: 'mockTests', label: t('mockTests') },
    { id: 'currentAffairs', label: t('currentAffairs') },
    { id: 'resources', label: t('resources') },
    { id: 'motivation', label: t('motivation') },
    { id: 'community', label: t('community') },
    { id: 'aiAssistant', label: t('aiAssistant') },
    { id: 'feedback', label: t('feedback') }
  ];

  if (user) {
    navItems.splice(1, 0, { id: 'dashboard', label: t('dashboard') });
    if (user.role === 'admin') {
      navItems.push({ id: 'admin', label: t('admin') });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentTab('home')}>
            <BookOpen className="h-8 w-8 text-saffron mr-2" />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-navy">{t('brand')}</span>
              <span className="hidden sm:block text-xs font-semibold text-saffron">{t('tagline')}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === item.id
                    ? 'bg-navy text-white'
                    : 'text-navy-light hover:bg-slate-100 hover:text-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Profile / Gamification stats / Auth Button */}
          <div className="flex items-center space-x-3">
            {/* Bilingual toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-navy transition-colors"
            >
              <Globe className="h-3.5 w-3.5 mr-1" />
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Gamified details */}
                <div 
                  onClick={() => setCurrentTab('dashboard')} 
                  className="flex items-center cursor-pointer space-x-2 bg-saffron/10 px-2 py-1 rounded-full text-saffron font-bold text-xs hover:bg-saffron/20 transition-colors"
                  title="Study Streak"
                >
                  <Flame className="h-4 w-4 streak-pulse text-saffron fill-saffron" />
                  <span>{profile?.current_streak || 0} Days</span>
                </div>
                
                <div 
                  onClick={() => setCurrentTab('dashboard')} 
                  className="hidden md:flex items-center cursor-pointer space-x-1.5 bg-navy/5 px-2.5 py-1 rounded-full text-navy font-bold text-xs hover:bg-navy/10 transition-colors"
                >
                  <Award className="h-4 w-4 text-gold fill-gold" />
                  <span>Lvl {profile?.level || 1}</span>
                </div>

                <div 
                  onClick={() => setCurrentTab('dashboard')} 
                  className="hidden md:block text-xs font-bold text-navy-light hover:underline cursor-pointer"
                >
                  {profile?.points || 0} XP
                </div>

                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="p-1 rounded-full bg-slate-100 border border-slate-300 text-navy hover:bg-slate-200"
                  title="Dashboard"
                >
                  <User className="h-4 w-4" />
                </button>
                
                <button
                  onClick={logout}
                  className="p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsRegisterMode(false);
                  setAuthError('');
                  setShowAuthModal(true);
                }}
                className="px-4 py-1.5 rounded-full bg-saffron text-white hover:bg-saffron-dark text-sm font-semibold transition-colors shadow-md shadow-saffron/20"
              >
                {t('login')}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1 rounded-md text-navy hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/95 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-md text-base font-semibold ${
                currentTab === item.id
                  ? 'bg-navy text-white'
                  : 'text-navy-light hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          {user && (
            <div className="border-t border-slate-200 mt-2 pt-2 flex items-center justify-between px-4">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-navy-light">
                <Flame className="h-4 w-4 text-saffron fill-saffron" />
                <span>{profile?.current_streak || 0} Streak</span>
                <span className="mx-1">•</span>
                <span>Lvl {profile?.level || 1}</span>
                <span className="mx-1">•</span>
                <span>{profile?.points || 0} XP</span>
              </div>
              <button onClick={logout} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="px-4"
        >
          <div 
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '30px',
            }}
            className="w-[95%] sm:w-full max-w-[500px] bg-white shadow-2xl border border-slate-200 premium-shadow-lg relative flex flex-col"
          >
            {/* Close button */}
            <button 
              onClick={() => setShowAuthModal(false)} 
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 disabled:opacity-50"
              style={{ zIndex: 10 }}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Content */}
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-navy tracking-tight">
                {isRegisterMode ? 'Create Free Account' : 'Welcome Back'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Join BeginUPSC Preparation Platform
              </p>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs font-medium flex items-start">
                  <ShieldAlert className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Username</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy disabled:opacity-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Password</label>
                <input
                  type="password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy disabled:opacity-50"
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Role</label>
                  <select
                    value={role}
                    disabled={isSubmitting}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy disabled:opacity-50"
                  >
                    <option value="student">Aspirant (Student)</option>
                    <option value="admin">Administrator (Upload Access)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-saffron hover:bg-saffron-dark text-white font-semibold text-sm transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isRegisterMode ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isRegisterMode ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError('');
                  }}
                  className="text-navy hover:underline font-bold disabled:opacity-50"
                >
                  {isRegisterMode ? 'Login Here' : 'Create Free Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-xl shadow-xl flex items-center gap-3 border min-w-[300px] max-w-sm ${
                t.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {t.type === 'success' ? (
                <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
              )}
              <div className="text-sm font-semibold flex-1">{t.message}</div>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="text-slate-400 hover:text-slate-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </header>
  );
}
