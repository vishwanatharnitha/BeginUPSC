import React from 'react';
import Flowcharts from '../components/Flowcharts';
import { HelpCircle, Award, Shield, FileText, CheckCircle2 } from 'lucide-react';

export default function Guide({ setCurrentTab }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Complete UPSC Beginner Guide</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
          Start your civil services preparation from absolute zero. Learn how the exam works, the eligibility criteria, and the prestigious service structures.
        </p>
      </div>

      {/* 1. INTRODUCTION SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-navy flex items-center">
              <HelpCircle className="h-5 w-5 text-saffron mr-2" />
              What is UPSC & CSE?
            </h2>
            <p className="text-xs sm:text-sm text-navy-light leading-relaxed">
              The **Union Public Service Commission (UPSC)** is India's premier central recruiting agency. It is responsible for appointments to and examinations for All India Services and group A & group B of Central services.
            </p>
            <p className="text-xs sm:text-sm text-navy-light leading-relaxed">
              The **Civil Services Examination (CSE)** is a nationwide competitive exam conducted by the UPSC for recruitment to various Civil Services of the Government of India, including the prestigious IAS, IPS, IFS, and IRS.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-saffron font-bold">
            Consistently rated as one of the toughest examinations in the world.
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-4">
          <h2 className="text-xl font-bold text-navy flex items-center">
            <Award className="h-5 w-5 text-gold mr-2" />
            Prestigious Services Recruited
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <strong className="text-navy block">IAS</strong>
              <span className="text-slate-500">Indian Administrative Service. Executes policies, manages districts.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <strong className="text-navy block">IPS</strong>
              <span className="text-slate-500">Indian Police Service. Leads law enforcement and safety forces.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <strong className="text-navy block">IFS</strong>
              <span className="text-slate-500">Indian Foreign Service. Represents India globally in embassies.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <strong className="text-navy block">IRS</strong>
              <span className="text-slate-500">Indian Revenue Service. Directs national tax systems and custom policies.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE FLOWCHART TIMELINE */}
      <Flowcharts />

      {/* 3. CORE ELIGIBILITY OVERVIEWS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
        <h3 className="text-xl font-bold text-navy border-b border-slate-100 pb-3 flex items-center">
          <Shield className="h-5 w-5 text-saffron mr-2" /> Basic Eligibility Standards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="font-extrabold text-navy text-sm">Educational Qualification</h4>
            <p className="text-slate-600 leading-relaxed">
              A candidate must hold a **Graduate Degree** from any university incorporated by an Act of the Central or State Legislature, or other educational institution established by an Act of Parliament. Candidates in their final year can also apply.
            </p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <h4 className="font-extrabold text-navy text-sm">Age Relaxation & Limits</h4>
            <p className="text-slate-600 leading-relaxed">
              - **General**: 21 - 32 years (6 attempts)
              <br />- **OBC**: 21 - 35 years (9 attempts)
              <br />- **SC/ST**: 21 - 37 years (Unlimited attempts)
              <br />- **PwD**: 21 - 42 years (9 attempts for Gen/OBC)
            </p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <h4 className="font-extrabold text-navy text-sm">Nationality</h4>
            <p className="text-slate-600 leading-relaxed">
              - For **IAS, IPS, and IFS**, the candidate must be a citizen of India.
              <br />- For other services, the candidate can be a citizen of India, subject of Nepal, subject of Bhutan, or Tibetan refugee who came over before January 1, 1962.
            </p>
          </div>
        </div>
      </div>

      {/* 4. SYLLABUS DOWNLOAD Call to Action */}
      <div className="gradient-saffron rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold flex items-center">
            <FileText className="h-5 w-5 mr-2 text-white" /> Get the Official UPSC Syllabus
          </h3>
          <p className="text-xs text-white/95 max-w-xl">
            A comprehensive, micro-topic breakdown of the UPSC syllabus is key to starting your preparation. Download it for free from our resource section.
          </p>
        </div>
        <button 
          onClick={() => setCurrentTab('resources')}
          className="px-6 py-3 bg-navy hover:bg-navy-dark text-white rounded-full font-bold text-xs transition-colors shrink-0 shadow-lg"
        >
          Get Syllabus PDF
        </button>
      </div>
    </div>
  );
}
