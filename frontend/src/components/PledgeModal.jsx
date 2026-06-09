import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckSquare, ShieldCheck, Square } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PledgeModal() {
  const { hasAcceptedPledge, acceptPledge, user } = useAuth();
  const { t } = useLanguage();

  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [c4, setC4] = useState(false);

  // Allow proceeding only if all 4 checks are ticked
  const canProceed = c1 && c2 && c3 && c4;

  if (hasAcceptedPledge) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-navy/95 backdrop-blur-md px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 premium-shadow-lg p-6 sm:p-10 text-center flex flex-col max-h-[90vh]"
      >
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          <div className="flex justify-center mb-4 text-saffron">
            <ShieldCheck className="h-16 w-16 streak-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mb-4 tracking-tight">
            {t('pledgeTitle')}
          </h2>

          <p className="text-sm sm:text-base text-navy-light leading-relaxed mb-6 italic max-w-xl mx-auto">
            "{t('pledgeText')}"
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 text-left max-w-lg mx-auto space-y-3">
            <div 
              onClick={() => setC1(!c1)} 
              className="flex items-center space-x-3 cursor-pointer select-none hover:bg-slate-100/50 p-2 rounded-lg transition-colors"
            >
              {c1 ? <CheckSquare className="h-5 w-5 text-saffron fill-saffron/10" /> : <Square className="h-5 w-5 text-slate-400" />}
              <span className="text-xs sm:text-sm font-semibold text-navy">{t('pledge1')}</span>
            </div>

            <div 
              onClick={() => setC2(!c2)} 
              className="flex items-center space-x-3 cursor-pointer select-none hover:bg-slate-100/50 p-2 rounded-lg transition-colors"
            >
              {c2 ? <CheckSquare className="h-5 w-5 text-saffron fill-saffron/10" /> : <Square className="h-5 w-5 text-slate-400" />}
              <span className="text-xs sm:text-sm font-semibold text-navy">{t('pledge2')}</span>
            </div>

            <div 
              onClick={() => setC3(!c3)} 
              className="flex items-center space-x-3 cursor-pointer select-none hover:bg-slate-100/50 p-2 rounded-lg transition-colors"
            >
              {c3 ? <CheckSquare className="h-5 w-5 text-saffron fill-saffron/10" /> : <Square className="h-5 w-5 text-slate-400" />}
              <span className="text-xs sm:text-sm font-semibold text-navy">{t('pledge3')}</span>
            </div>

            <div 
              onClick={() => setC4(!c4)} 
              className="flex items-center space-x-3 cursor-pointer select-none hover:bg-slate-100/50 p-2 rounded-lg transition-colors"
            >
              {c4 ? <CheckSquare className="h-5 w-5 text-saffron fill-saffron/10" /> : <Square className="h-5 w-5 text-slate-400" />}
              <span className="text-xs sm:text-sm font-semibold text-navy">{t('pledge4')}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (canProceed) {
                acceptPledge();
              }
            }}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-full font-bold text-base transition-all duration-300 ${
              canProceed 
                ? 'bg-saffron text-white hover:bg-saffron-dark cursor-pointer shadow-lg shadow-saffron/30 scale-105' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {t('pledgeAccept')}
          </button>

          <p className="text-[10px] text-slate-400 mt-4">
            * Taking this pledge initiates your personalized educational study trackers.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
