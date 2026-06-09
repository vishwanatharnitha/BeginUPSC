import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Download, FileText, BookOpen, Layers, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Resources() {
  const { API_URL } = useAuth();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  const categories = [
    { id: '', label: 'All Resources' },
    { id: 'syllabus', label: 'UPSC Syllabus' },
    { id: 'ncert', label: 'NCERT Books' },
    { id: 'report', label: 'Government Reports' }
  ];

  useEffect(() => {
    fetchResources();
  }, [category, search]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/resources?category=${category}&search=${search}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (e) {
      // Fallback local resources
      setResources([
        { id: 1, title: 'UPSC Civil Services Examination Official Syllabus Checklist', category: 'syllabus', pdf_url: '#' },
        { id: 2, title: 'Class 6 NCERT History - Our Pasts I', category: 'ncert', pdf_url: '#' },
        { id: 3, title: 'Class 11 NCERT Indian Constitution at Work', category: 'ncert', pdf_url: '#' },
        { id: 4, title: 'NITI Aayog Strategy for New India @ 75 Report', category: 'report', pdf_url: '#' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getResourceContent = (title) => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('syllabus') || lowercaseTitle.includes('notification')) {
      return `<h2>UPSC Civil Services Examination Official Syllabus</h2>
      <p>The UPSC Civil Services Examination is conducted in three stages:</p>
      <h3>Stage 1: Preliminary Examination (Objective Type)</h3>
      <ul>
        <li><strong>Paper I: General Studies (GS)</strong>: 100 questions, 200 marks. Syllabus covers: History of India and Indian National Movement, Indian and World Geography, Indian Polity and Governance, Economic and Social Development, General issues on Environmental Ecology, Bio-diversity and Climate Change, and General Science.</li>
        <li><strong>Paper II: Civil Services Aptitude Test (CSAT)</strong>: 80 questions, 200 marks (Qualifying in nature, requires 33%). Syllabus covers: Comprehension, Interpersonal skills, Logical reasoning and analytical ability, Decision-making and problem-solving, General mental ability, Basic numeracy (numbers and their relations, orders of magnitude, etc. - Class X level), Data interpretation (charts, graphs, tables, data sufficiency etc. - Class X level).</li>
      </ul>
      <h3>Stage 2: Main Examination (Written / Descriptive Type)</h3>
      <ul>
        <li><strong>Paper A (Indian Language)</strong> & <strong>Paper B (English)</strong>: Qualifying papers, 300 marks each.</li>
        <li><strong>Paper I (Essay)</strong>: 250 marks. Write two essays on diverse topics.</li>
        <li><strong>Paper II (General Studies I)</strong>: 250 marks. Covers Indian Heritage and Culture, History and Geography of the World and Society.</li>
        <li><strong>Paper III (General Studies II)</strong>: 250 marks. Covers Governance, Constitution, Polity, Social Justice and International Relations.</li>
        <li><strong>Paper IV (General Studies III)</strong>: 250 marks. Covers Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management.</li>
        <li><strong>Paper V (General Studies IV)</strong>: 250 marks. Covers Ethics, Integrity and Aptitude.</li>
        <li><strong>Paper VI & VII (Optional Subject Paper I & II)</strong>: 250 marks each. Chosen from list of 48 optional subjects.</li>
      </ul>
      <h3>Stage 3: Personality Test (Interview)</h3>
      <ul>
        <li>Assessment of the candidate's personality, suitability for a career in public services, mental alertness, critical powers of assimilation, clear and logical exposition, and depth of interest. Out of 275 marks.</li>
      </ul>`;
    }
    
    if (lowercaseTitle.includes('class 6') || lowercaseTitle.includes('our pasts') || lowercaseTitle.includes('hist_6')) {
      return `<h2>NCERT History - Class 6 (Our Pasts I)</h2>
      <p>Foundational history textbook covering ancient Indian civilisations, dynasties, and societies.</p>
      <h3>Chapter Directory & Key Outlines:</h3>
      <ul>
        <li><strong>Chapter 1: What, Where, How and When?</strong>: Deals with early human settlements near rivers, deciphering scripts, and dating methods (BC, AD, BCE).</li>
        <li><strong>Chapter 2: From Hunting-Gathering to Growing Food</strong>: Traces transition from Paleolithic hunters to Neolithic farmers and herders. Details Mehrgarh excavations.</li>
        <li><strong>Chapter 3: In the Earliest Cities</strong>: Study of the Harappan Civilisation. Covers town planning, drainage, drainage networks, granaries, sealing trades, and causes of decline.</li>
        <li><strong>Chapter 4: What Books and Burials Tell Us</strong>: Vedic literature overview. The Rigveda, Megalithic burial sites like Inamgaon, and social distinctions.</li>
        <li><strong>Chapter 5: Kingdoms, Kings and an Early Republic</strong>: Evolution of Janapadas and Mahajanapadas. Details on Magadha's rising hegemony and the Vajji oligarchical Sangha structure.</li>
        <li><strong>Chapter 6: New Questions and Ideas</strong>: Rise of Buddhism (Siddhartha's teachings) and Jainism (Vardhamana Mahavira). Overview of the Upanishads and Sangha regulations.</li>
        <li><strong>Chapter 7: Ashoka, The Emperor Who Gave Up War</strong>: Mauryan empire outline. Chandragupta Maurya, Chanakya's Arthashastra, Kalinga war, and Ashoka's Dhamma policies.</li>
      </ul>`;
    }

    if (lowercaseTitle.includes('class 11') || lowercaseTitle.includes('constitution at work') || lowercaseTitle.includes('polity') || lowercaseTitle.includes('pol_11') || lowercaseTitle.includes('geo_11')) {
      return `<h2>NCERT Polity / Geography - Class 11 Guides</h2>
      <p>Core textbooks for understanding the political system and physical geography of India.</p>
      <h3>Chapter Outlines:</h3>
      <ul>
        <li><strong>Chapter 1: Constitution: Why and How?</strong>: Functions of a Constitution, authority of a constitution, and the constituent assembly background.</li>
        <li><strong>Chapter 2: Rights in the Indian Constitution</strong>: In-depth review of Fundamental Rights, Directive Principles of State Policy (DPSP), and Fundamental Duties.</li>
        <li><strong>Chapter 3: Election and Representation</strong>: First-Past-The-Post vs Proportional Representation, Delimitation Commission, and independent Election Commission of India.</li>
        <li><strong>Chapter 4: Executive</strong>: Parliamentary Executive, President (powers and vetoes), Prime Minister, Cabinet, and permanent civil services.</li>
        <li><strong>Chapter 5: Legislature</strong>: Need for bicameral legislatures, powers of Lok Sabha and Rajya Sabha, and law-making process.</li>
        <li><strong>Chapter 6: Judiciary</strong>: Independence of judiciary, structure of courts, Judicial Review, and Public Interest Litigation (PIL).</li>
        <li><strong>Chapter 7: Federalism</strong>: Division of powers, federal features, and state conflicts (Article 356, Governor role).</li>
        <li><strong>Chapter 8: Local Governments</strong>: 73rd and 74th Constitutional Amendment Acts, decentralisation success and challenges.</li>
      </ul>`;
    }

    if (lowercaseTitle.includes('niti aayog') || lowercaseTitle.includes('report') || lowercaseTitle.includes('arc_report')) {
      return `<h2>NITI Aayog Strategy / Administrative Reforms (ARC) Summaries</h2>
      <p>Key administrative and policy documents framing strategic targets across key economic and institutional sectors.</p>
      <h3>Key Strategic Pillars:</h3>
      <ul>
        <li><strong>1. Drivers:</strong> Accelerate GDP growth to 8%, double farmers' incomes, boost manufacturing via Make in India, and expand digital connectivity.</li>
        <li><strong>2. Infrastructure:</strong> Expand national highways, double railway track capacity, deploy green energy hubs, and digitize postal services.</li>
        <li><strong>3. Inclusion:</strong> Universal health insurance (Ayushman Bharat), education quality monitoring, and targeted welfare schemes for scheduled castes/tribes and women.</li>
        <li><strong>4. Governance:</strong> Civil services reforms, judicial improvements to reduce case backlogs, and database integrations for transparent welfare delivery.</li>
      </ul>`;
    }

    // Default fallback content
    return `<h2>${title}</h2>
    <p>This reference resource is available for direct reading and download inside the BeginUPSC platform.</p>
    <h3>Study Recommendations:</h3>
    <ul>
      <li>Cross-reference the index with the official UPSC syllabus to filter relevant topics.</li>
      <li>Create concise, active-recall revision notes and mind maps for each section.</li>
      <li>Attempt subject mock tests once you finish reading to reinforce retention.</li>
    </ul>`;
  };

  const getCleanTextContent = (htmlText) => {
    return htmlText
      .replace(/<[^>]*>/g, '\n') // strip tags
      .replace(/\n+/g, '\n')     // consolidate newlines
      .trim();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Free UPSC Resources & PDF Library</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Search and download standard NCERT textbooks, national committee reports, union budgets, and official syllabus checklists.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search textbook or document name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                category === c.id
                  ? 'bg-navy text-white border-navy shadow-sm'
                  : 'bg-white text-navy border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold text-xs">Loading PDF catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => {
            const docHtml = getResourceContent(res.title);
            const cleanText = getCleanTextContent(docHtml);
            const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(cleanText)}`;
            const downloadName = `${res.title.replace(/[^a-zA-Z0-9]/g, '_')}_StudyGuide.txt`;

            return (
              <div key={res.id} className="bg-white border border-slate-200 rounded-3xl p-6 premium-card premium-shadow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white px-2 py-0.5 bg-saffron rounded-full uppercase tracking-wider">
                    {res.category}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-navy leading-snug">{res.title}</h3>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
                  <button
                    onClick={() => setViewingDoc({ title: res.title, html: docHtml, downloadHref, downloadName })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy rounded-lg font-bold text-[10px] transition-all flex items-center space-x-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View In-App</span>
                  </button>

                  <a
                    href={downloadHref}
                    download={downloadName}
                    className="px-3 py-1.5 bg-navy hover:bg-navy-dark text-white rounded-lg font-bold text-[10px] transition-all flex items-center space-x-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })}

          {resources.length === 0 && (
            <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-semibold text-xs italic">
              No syllabus resources or books found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal Overlay */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[80vh]"
            >
              {/* Modal Header */}
              <div className="gradient-navy px-6 py-5 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-saffron" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold truncate max-w-[500px]">{viewingDoc.title}</h3>
                    <p className="text-[10px] text-slate-300">BeginUPSC Integrated PDF/Document Reader</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable Document) */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-50/50">
                <article
                  className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: viewingDoc.html }}
                />
              </div>

              {/* Modal Footer actions */}
              <div className="p-4 border-t border-slate-200 bg-white flex justify-end space-x-3 shrink-0">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-505 border border-slate-200 hover:bg-slate-50"
                >
                  Close Reader
                </button>
                <a
                  href={viewingDoc.downloadHref}
                  download={viewingDoc.downloadName}
                  className="px-5 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download File</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
