import React, { useState } from 'react';
import { FileText, Search, BookOpen, Download, HelpCircle, Check, ChevronDown } from 'lucide-react';

export default function Pyqs() {
  const [paperType, setPaperType] = useState('prelims');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const pyqList = [
    {
      id: 1,
      type: 'prelims',
      year: '2024',
      subject: 'Polity',
      question: 'With reference to the Finance Commission of India, which of the following statements is correct?',
      options: {
        A: 'It encourages the inflow of foreign capital for infrastructure development.',
        B: 'It facilitates the proper distribution of finances among the Public Sector Undertakings.',
        C: 'It ensures transparency in financial administration.',
        D: 'None of the statements (A), (B) and (C) given above is correct in this context.'
      },
      correct: 'D',
      explanation: 'Under Article 280, the primary duty of the Finance Commission is to recommend to the President the distribution of net tax proceeds between the Union and the States, and allocation of shares among states. Statements A, B, and C are not duties of the Finance Commission.'
    },
    {
      id: 2,
      type: 'prelims',
      year: '2023',
      subject: 'History',
      question: 'With reference to ancient India, Consuls/Mahattaras and Pattakilas were names associated with:',
      options: {
        A: 'Military officers',
        B: 'Village administration officials',
        C: 'Guild heads',
        D: 'Official priests in temples'
      },
      correct: 'B',
      explanation: 'In early medieval and ancient India, Mahattara (village elders/officials) and Pattakila (village headmen/tax collectors) were prominent officials in local village administration.'
    },
    {
      id: 3,
      type: 'mains',
      year: '2024',
      subject: 'Polity',
      question: 'GS Paper II: "The office of the Governor has been center of center-state friction for decades." Analyze this statement in the context of recent Supreme Court judgments.',
      options: null,
      correct: 'Descriptive Answer Guideline',
      explanation: 'Key points to include: Article 153/154 duties of Governor. Friction points: reservation of bills for President (Article 200), recommendations for President Rule (Article 356), appointment of Chief Ministers in hung assemblies. Reference cases: Rameshwar Prasad case, Nabam Rebia case (2016) regarding discretionary powers limitations, and Shamsher Singh case.'
    },
    {
      id: 4,
      type: 'essay',
      year: '2024',
      subject: 'Essay',
      question: 'Write an essay on: "Forests are the best case studies for economic excellence."',
      options: null,
      correct: 'Essay Structure Guideline',
      explanation: 'Introduction: Hook detailing circular economies of forests. Body Paragraphs: 1. Ecosystem services as economic benchmarks (water purification, soil retention). 2. Sustainable harvesting vs resource exhaustion. 3. Tribal economies as live case studies of conservation and trade. 4. Climate mitigation cost benefits. Conclusion: Synthesis of ecological capital and GDP recalculations.'
    }
  ];

  const filtered = pyqList.filter(item => {
    if (item.type !== paperType) return false;
    if (selectedYear && item.year !== selectedYear) return false;
    if (selectedSubject && item.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Previous Year Papers (PYQs) Explorer</h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Analyze official UPSC questions, download essay prompt templates, and read complete solutions and grading parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-2 border-b border-slate-200 pb-1">
        {['prelims', 'mains', 'essay'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setPaperType(type);
              setSelectedSubject('');
              setExpandedId(null);
            }}
            className={`px-6 py-2.5 font-bold text-xs sm:text-sm capitalize border-b-2 transition-all ${
              paperType === type
                ? 'border-saffron text-saffron'
                : 'border-transparent text-navy-light hover:text-navy'
            }`}
          >
            {type} Papers
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Year select */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy focus:outline-none"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Subject select */}
          {paperType !== 'essay' && (
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy focus:outline-none"
              >
                <option value="">All Subjects</option>
                <option value="Polity">Polity</option>
                <option value="History">History</option>
              </select>
            </div>
          )}
        </div>

        <span className="text-[10px] font-extrabold text-white px-2.5 py-1 bg-navy rounded-full uppercase tracking-wider shrink-0">
          UPSC Paper Key Vault
        </span>
      </div>

      {/* Questions feed */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 premium-shadow space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>Paper Year: {item.year}</span>
              <span className="uppercase">{item.subject}</span>
            </div>

            <p className="font-extrabold text-sm sm:text-base text-navy leading-relaxed">
              Q{idx + 1}. {item.question}
            </p>

            {/* Render options for prelims */}
            {item.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {Object.entries(item.options).map(([k, v]) => (
                  <div key={k} className="p-3 bg-slate-50 border border-slate-250/65 rounded-xl">
                    <strong className="text-saffron mr-2">{k}.</strong>
                    <span className="text-slate-650 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Answer toggle details */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="text-xs font-bold text-saffron flex items-center hover:underline focus:outline-none"
              >
                <span>{expandedId === item.id ? 'Hide Explanation' : 'View Correct Answer & Explanation'}</span>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
              </button>

              {expandedId === item.id && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-3 space-y-3 text-xs">
                  <div className="flex items-center text-navy font-bold">
                    <Check className="h-4.5 w-4.5 text-green-500 mr-2" />
                    <span>Correct Key: {item.correct}</span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2.5">
                    <span className="font-extrabold text-navy block mb-1">Detailed Explanation & Analysis:</span>
                    <p className="text-slate-650 leading-relaxed">{item.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-semibold text-xs italic">
            No PYQ papers recorded matching your selection criteria.
          </div>
        )}
      </div>
    </div>
  );
}
