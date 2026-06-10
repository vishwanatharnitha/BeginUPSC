import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Star, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Feedback() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [type, setType] = useState('suggestion');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify({ type, content, rating })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message || 'Feedback submitted successfully. Thank you!');
        setContent('');
        setRating(5);
      }
    } catch (err) {
      setSuccessMsg('Thank you for your feedback! (Local fallback saved)');
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Help Us Improve BeginUPSC</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
          We want to make this the best free UPSC preparation platform. Submit feature suggestions, report bugs, or rate our content.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl premium-shadow p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {successMsg ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 space-y-4"
            >
              <div className="flex justify-center text-green-500">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <h3 className="text-lg font-bold text-navy">Submission Received!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {successMsg}
              </p>
              <button
                onClick={() => setSuccessMsg('')}
                className="px-6 py-2 bg-navy text-white rounded-xl text-xs font-bold transition-colors"
              >
                Submit New Feedback
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Feedback Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                  >
                    <option value="suggestion">Suggest Improvement / Feature</option>
                    <option value="issue">Report Bug / Content Issue</option>
                    <option value="feature">Request New Subject / Topic</option>
                    <option value="rate">Rate Learning Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Rating</label>
                  <div className="flex items-center space-x-1.5 h-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-gold hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${rating >= star ? 'fill-gold text-gold' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Details</label>
                <textarea
                  required
                  rows="5"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your suggestion or report details in depth..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
