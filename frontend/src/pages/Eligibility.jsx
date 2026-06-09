import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Award, Calendar, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Eligibility() {
  const { API_URL } = useAuth();
  
  // Form Fields
  const [age, setAge] = useState('21');
  const [category, setCategory] = useState('general');
  const [nationality, setNationality] = useState('Indian');
  const [graduationStatus, setGraduationStatus] = useState('completed');
  const [attemptsUsed, setAttemptsUsed] = useState('0');

  // Result State
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/eligibility/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          category,
          nationality,
          graduationStatus,
          attemptsUsed
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Verification failed');
      }
    } catch (err) {
      // Local Fallback if server offline
      performLocalVerification();
    } finally {
      setLoading(false);
    }
  };

  const performLocalVerification = () => {
    const ageNum = parseInt(age, 10);
    const attemptsUsedNum = parseInt(attemptsUsed, 10);

    let maxAge = 32;
    let maxAttempts = 6;
    const isIndian = nationality.toLowerCase() === 'indian';

    switch (category.toLowerCase()) {
      case 'obc':
        maxAge = 35;
        maxAttempts = 9;
        break;
      case 'sc':
      case 'st':
        maxAge = 37;
        maxAttempts = 99; // Unlimited
        break;
      case 'pwd':
        maxAge = 42;
        maxAttempts = 9;
        break;
      case 'general':
      default:
        maxAge = 32;
        maxAttempts = 6;
        break;
    }

    let isEligible = true;
    const reasons = [];

    if (ageNum < 21) {
      isEligible = false;
      reasons.push('Minimum age required is 21 years.');
    }
    if (ageNum > maxAge) {
      isEligible = false;
      reasons.push(`Maximum age allowed for your category (${category.toUpperCase()}) is ${maxAge} years. You are ${ageNum}.`);
    }
    if (attemptsUsedNum >= maxAttempts) {
      isEligible = false;
      reasons.push(`Maximum attempts allowed for ${category.toUpperCase()} is ${maxAttempts === 99 ? 'Unlimited' : maxAttempts}. You have used ${attemptsUsedNum}.`);
    }
    if (graduationStatus === 'not_graduated') {
      isEligible = false;
      reasons.push('You must at least be in the final year of graduation to be eligible.');
    }

    const eligibleServices = [];
    if (isEligible) {
      if (isIndian) {
        eligibleServices.push('IAS (Indian Administrative Service)', 'IPS (Indian Police Service)', 'IFS (Indian Foreign Service)', 'IRS (Indian Revenue Service)', 'Other Group A/B Services');
      } else {
        eligibleServices.push('IRS (Indian Revenue Service)', 'Other Group A/B Central Services');
        reasons.push('Note: IAS, IPS, and IFS are reserved exclusively for Indian citizens.');
      }
    }

    setResult({
      eligible: isEligible,
      remainingAttempts: maxAttempts === 99 ? 'Unlimited' : Math.max(0, maxAttempts - attemptsUsedNum),
      servicesEligibleFor: eligibleServices,
      reasons,
      summary: isEligible 
        ? 'Congratulations! You fulfill all base eligibility criteria for the UPSC Civil Services Examination.' 
        : 'You do not meet one or more eligibility requirements at this time.'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Smart UPSC Eligibility Checker</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Verify your attempts, age limit status, and civil services qualification compatibility using our official rules checker.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6">
          <h3 className="text-lg font-bold text-navy border-b border-slate-100 pb-3 flex items-center">
            <Calendar className="h-5 w-5 text-saffron mr-2" /> Enter Aspirant Details
          </h3>

          <form onSubmit={handleCheck} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age (Years)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="16"
                  max="60"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy focus:border-navy"
                >
                  <option value="general">General</option>
                  <option value="obc">OBC (Other Backward Classes)</option>
                  <option value="sc">SC (Scheduled Caste)</option>
                  <option value="st">ST (Scheduled Tribe)</option>
                  <option value="pwd">PwD (Persons with Benchmark Disability)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nationality</label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy focus:border-navy"
                >
                  <option value="Indian">Indian Citizen</option>
                  <option value="Nepal">Subject of Nepal</option>
                  <option value="Bhutan">Subject of Bhutan</option>
                  <option value="Tibetan">Tibetan Refugee (before Jan 1962)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Graduation Status</label>
                <select
                  value={graduationStatus}
                  onChange={(e) => setGraduationStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy focus:border-navy"
                >
                  <option value="completed">Degree Completed (Graduate)</option>
                  <option value="final_year">Final Year Student</option>
                  <option value="not_graduated">Non-Graduate (No College Degree)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">UPSC Attempts Already Used</label>
              <input
                type="number"
                required
                value={attemptsUsed}
                onChange={(e) => setAttemptsUsed(e.target.value)}
                min="0"
                max="20"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy focus:border-navy"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-sm transition-colors shadow-lg"
            >
              {loading ? 'Analyzing Criteria...' : 'Check UPSC Eligibility'}
            </button>
          </form>
        </div>

        {/* Results panel */}
        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${result.eligible ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {result.eligible ? <ShieldCheck className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-navy">
                    {result.eligible ? 'You Are Eligible!' : 'Not Eligible Currently'}
                  </h3>
                  <span className="text-xs text-slate-500">UPSC CSE Eligibility Status</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2 text-xs">
                <p className="text-navy font-semibold">{result.summary}</p>
                <p className="font-bold text-saffron">Remaining Attempts: {result.remainingAttempts}</p>
              </div>

              {result.reasons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Key Points & Restrictions</h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.eligible && result.servicesEligibleFor.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center">
                    <Award className="h-4 w-4 mr-1 text-gold fill-gold/10" /> Services You Can Compete For:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.servicesEligibleFor.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-navy/5 text-navy font-bold text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-400">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">Enter your details and click the button to see your eligibility dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
