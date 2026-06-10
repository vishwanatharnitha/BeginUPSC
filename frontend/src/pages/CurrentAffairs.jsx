import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Calendar, Search, Download, FileText, Bell, Globe, Bookmark } from 'lucide-react';

export default function CurrentAffairs() {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [compilations, setCompilations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const categories = [
    { id: '', label: 'All Updates' },
    { id: 'National', label: 'National' },
    { id: 'International', label: 'International' },
    { id: 'Economy', label: 'Economy' },
    { id: 'Science', label: 'Science & Tech' },
    { id: 'Environment', label: 'Environment' }
  ];

  useEffect(() => {
    fetchArticles();
    fetchCompilations();
  }, [category, search]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/current-affairs?category=${category}&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (e) {
      // Offline fallback
      setArticles([
        { id: 1, title: 'Cabinet Approves New Green Hydrogen Initiative', category: 'Environment', content: 'The Union Cabinet has approved a special allocation for the expansion of Green Hydrogen hubs across India to facilitate clean energy transits.', published_date: '2026-06-08' },
        { id: 2, title: 'Indo-Pacific Trade Alliances & Security Dialogues', category: 'International', content: 'Bilateral meetings in New Delhi focused on trade barriers, cybersecurity cooperation, and naval coordination exercises.', published_date: '2026-06-07' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompilations = async () => {
    try {
      const res = await apiFetch('/current-affairs/pdf-compilations');
      if (res.ok) {
        const data = await res.json();
        setCompilations(data);
      }
    } catch (e) {
      setCompilations([
        { id: 1, month: 'May 2026', title: 'BeginUPSC Current Affairs Digest - May 2026', downloadUrl: '#', size: '4.8 MB' },
        { id: 2, month: 'April 2026', title: 'BeginUPSC Current Affairs Digest - April 2026', downloadUrl: '#', size: '5.2 MB' }
      ]);
    }
  };

  const toggleBookmark = (id) => {
    let updated;
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(bId => bId !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('bookmarkedArticles', JSON.stringify(updated));
  };

  const displayedArticles = showBookmarksOnly
    ? articles.filter(art => bookmarkedIds.includes(art.id))
    : articles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Daily Current Affairs Portal</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Stay updated with daily national and international events. Download monthly current affairs compilations for revision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Category tabs & Daily articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news articles..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 justify-end w-full sm:w-auto">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setShowBookmarksOnly(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    category === c.id && !showBookmarksOnly
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-navy border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}

              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                  showBookmarksOnly
                    ? 'bg-saffron text-white border-saffron shadow-sm'
                    : 'bg-white text-navy border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`h-3 w-3 ${showBookmarksOnly ? 'fill-white text-white' : 'text-saffron'}`} />
                <span>Bookmarks</span>
              </button>
            </div>
          </div>

          {/* Articles list */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold text-xs">Loading updates...</div>
          ) : (
            <div className="space-y-4">
              {displayedArticles.map(art => (
                <div key={art.id} className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white px-2 py-0.5 bg-saffron rounded-full uppercase tracking-wider">
                      {art.category}
                    </span>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(art.published_date).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => toggleBookmark(art.id)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-saffron transition-colors"
                        title={bookmarkedIds.includes(art.id) ? "Remove Bookmark" : "Bookmark Article"}
                      >
                        <Bookmark className={`h-4 w-4 ${bookmarkedIds.includes(art.id) ? 'fill-saffron text-saffron' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-navy text-base">{art.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{art.content}</p>
                </div>
              ))}

              {displayedArticles.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-semibold text-xs italic">
                  {showBookmarksOnly ? "No bookmarked news items found." : "No current affairs articles found."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Monthly Compilations */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 premium-shadow space-y-6 h-fit">
          <h3 className="text-sm font-black text-navy border-b border-slate-100 pb-3 uppercase tracking-wide flex items-center">
            <FileText className="h-4 w-4 mr-2 text-saffron" /> Monthly Digests
          </h3>

          <div className="space-y-3">
            {compilations.map(comp => (
              <div key={comp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                <div>
                  <span className="font-extrabold text-navy block">{comp.month} Digest</span>
                  <span className="text-[10px] text-slate-400">{comp.size} • PDF format</span>
                </div>
                
                <a
                  href={comp.downloadUrl}
                  onClick={(e) => { if(comp.downloadUrl === '#') e.preventDefault(); }}
                  className="p-2 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
