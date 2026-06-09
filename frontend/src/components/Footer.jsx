import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Globe } from 'lucide-react';

export default function Footer({ setCurrentTab }) {
  const { t } = useLanguage();
  return (
    <footer className="bg-navy text-slate-300 border-t border-navy-light pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <BookOpen className="h-7 w-7 text-saffron mr-2" />
              <span className="font-extrabold text-xl text-white tracking-tight">{t('brand')}</span>
            </div>
            <p className="text-sm text-slate-400">
              Build your civil services future completely free. Access syllabus roadmaps, standard NCERT materials, PYQs with detailed explanations, mock tests, and a community support system.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Learn & Test</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setCurrentTab('guide')} className="hover:text-white transition-colors">Beginner Guide</button></li>
              <li><button onClick={() => setCurrentTab('subjects')} className="hover:text-white transition-colors">Subject Library</button></li>
              <li><button onClick={() => setCurrentTab('mockTests')} className="hover:text-white transition-colors">Mock Test Platform</button></li>
              <li><button onClick={() => setCurrentTab('pyqs')} className="hover:text-white transition-colors">PYQ Explorer</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Self Motivation</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setCurrentTab('motivation')} className="hover:text-white transition-colors">Streak & Consistency</button></li>
              <li><button onClick={() => setCurrentTab('roadmaps')} className="hover:text-white transition-colors">Personalized Plans</button></li>
              <li><button onClick={() => setCurrentTab('currentAffairs')} className="hover:text-white transition-colors">Daily Current Affairs</button></li>
              <li><button onClick={() => setCurrentTab('resources')} className="hover:text-white transition-colors font-semibold text-saffron">NCERT Book Downloads</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">UPSC Preparation Platform</h4>
            <p className="text-sm text-slate-400 mb-4">
              Designed as a premium, high-quality, completely free alternative to expensive offline coaching centers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Globe className="h-4 w-4 text-saffron" />
              <span>Available in English and Hindi (हिन्दी)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-light pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BeginUPSC. Crafted for serious aspirants. No coaching fees, ever.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
