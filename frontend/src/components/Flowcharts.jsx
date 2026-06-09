import React, { useState } from 'react';
import { ArrowRight, HelpCircle, BookOpen, UserCheck, Milestone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Flowcharts() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      id: 0,
      title: '1. Prelims Examination',
      subtitle: 'Screening Round (Objective MCQ)',
      period: 'Typically in May/June',
      details: [
        { label: 'Paper I (GS)', info: '100 Questions, 200 Marks. Marks count for cutoff eligibility. Covers History, Polity, Geography, Economy, Env, S&T.' },
        { label: 'Paper II (CSAT)', info: '80 Questions, 200 Marks. Qualifying only (Requires min 33%, i.e., 66 Marks). Covers Math, Reasoning, English Comprehension.' },
        { label: 'Negative Marking', info: '1/3rd (0.33 of marks assigned to the question) is deducted for each incorrect answer.' }
      ],
      color: 'bg-navy',
      icon: BookOpen
    },
    {
      id: 1,
      title: '2. Mains Examination',
      subtitle: 'Written Descriptive Round',
      period: 'Typically in September',
      details: [
        { label: 'Qualifying Papers', info: 'Paper A (Indian Language) & Paper B (English). 300 Marks each. Requires min 25% to qualify.' },
        { label: 'Rank Scoring Papers', info: '9 papers in total. 1 Essay Paper (250 Marks), 4 General Studies Papers (GS I-IV, 250 Marks each), and 2 Optional Papers (250 Marks each).' },
        { label: 'Total Score', info: '1750 Marks. Cutoffs determine eligibility for the personality test.' }
      ],
      color: 'bg-saffron',
      icon: Milestone
    },
    {
      id: 2,
      title: '3. Personality Test (Interview)',
      subtitle: 'Oral Board Discussion',
      period: 'Typically in February - April',
      details: [
        { label: 'Location', info: 'UPSC Dholpur House, New Delhi.' },
        { label: 'Evaluation', info: 'Conducted by an esteemed board to assess mental alert, critical powers of assimilation, clear and logical exposition, and depth of interest.' },
        { label: 'Marks Allocation', info: '275 Marks. No minimum qualifying mark.' }
      ],
      color: 'bg-gold',
      icon: UserCheck
    },
    {
      id: 3,
      title: '4. Final Allocation',
      subtitle: 'Rank List & Service Assignment',
      period: 'Typically in May',
      details: [
        { label: 'Grand Total', info: 'Mains (1750) + Interview (275) = 2025 Marks determine your final rank.' },
        { label: 'Service Options', info: 'IAS, IPS, IFS, IRS, and 20+ other Central Civil Services depending on rank, category, and preferences.' },
        { label: 'Foundation Academy', info: 'LBSNAA (Mussoorie), SVPNPA (Hyderabad), or Sushma Swaraj Institute of Foreign Service (Delhi).' }
      ],
      color: 'bg-slate-700',
      icon: ArrowRight
    }
  ];

  const current = stages[activeStage];
  const Icon = current.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow">
      <h3 className="text-xl font-bold text-navy mb-6 text-center">Interactive UPSC CSE Exam Flowchart</h3>
      
      {/* Visual Timeline Nodes */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <button
              onClick={() => setActiveStage(stage.id)}
              className={`flex-1 w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                activeStage === stage.id
                  ? 'border-saffron bg-saffron/5 shadow-md shadow-saffron/5'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg text-white ${idx === 0 ? 'bg-navy' : idx === 1 ? 'bg-saffron' : idx === 2 ? 'bg-gold' : 'bg-slate-600'}`}>
                  <stage.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy">{stage.title}</h4>
                  <p className="text-xs text-slate-500">{stage.period}</p>
                </div>
              </div>
            </button>
            {idx < 3 && <ArrowRight className="hidden lg:block h-5 w-5 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Explanatory Stage details card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="border border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col md:flex-row gap-6 items-start"
        >
          <div className="w-full md:w-1/3 space-y-2">
            <span className={`inline-block text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full uppercase tracking-wider ${current.color}`}>
              Selected Stage
            </span>
            <h4 className="text-xl font-bold text-navy flex items-center">
              <Icon className="h-5 w-5 mr-2 text-saffron" />
              {current.title}
            </h4>
            <p className="text-sm text-saffron font-bold">{current.subtitle}</p>
            <p className="text-xs text-slate-500 font-semibold">{current.period}</p>
          </div>

          <div className="w-full md:w-2/3 space-y-4">
            <h5 className="font-bold text-sm text-navy border-b border-slate-200 pb-2 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1.5 text-navy-light" /> Stage Breakdown & Scoring Rules
            </h5>
            <div className="grid grid-cols-1 gap-3">
              {current.details.map((detail, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/60 text-xs">
                  <span className="font-bold text-navy block mb-1">{detail.label}</span>
                  <p className="text-slate-600 leading-relaxed">{detail.info}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
