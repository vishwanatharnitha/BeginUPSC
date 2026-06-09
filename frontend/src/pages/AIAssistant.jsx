import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, HelpCircle, Loader2 } from 'lucide-react';

export default function AIAssistant() {
  const { API_URL } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your BeginUPSC AI Study Assistant. Ask me anything about the UPSC CSE exam pattern, subject strategies, age limits, standard booklists, or how to prepare!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('mentor');
  const chatEndRef = useRef(null);

  // Initialize bot greeting depending on mode
  useEffect(() => {
    let text = 'Hello! I am your BeginUPSC AI Study Assistant. Ask me anything about the UPSC CSE exam pattern, subject strategies, age limits, standard booklists, or how to prepare!';
    if (mode === 'subject') {
      text = 'Hello! I am in Subject Help mode. Ask me specific questions about any of the 12 UPSC subjects, key definitions, or core syllabus modules.';
    } else if (mode === 'planning') {
      text = 'Hello! I am in Study Planning mode. Share your daily routine or timeline details, and I will help you formulate target allocations.';
    } else if (mode === 'writing') {
      text = 'Hello! I am in Answer Writing Guidance mode. Ask me how to structure GS papers essays, write introductions, outline conclusions, or draw maps.';
    } else if (mode === 'motivation') {
      text = 'Hello! I am in Motivation Support mode. UPSC is a mental marathon. Ask me for inspiring civil service quotes, focus tips, or anxiety relief strategies.';
    }
    setMessages([{ sender: 'bot', text }]);
  }, [mode]);

  const presets = [
    { label: 'UPSC Syllabus', text: 'What is the syllabus for UPSC CSE?' },
    { label: 'Attempts & Age Limits', text: 'Tell me about the age limits and attempt limits.' },
    { label: 'Standard Booklist', text: 'Which NCERTs and reference books should I read?' },
    { label: 'IAS vs IPS', text: 'What is the difference between IAS and IPS?' }
  ];

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || inputText;
    if (!queryText.trim()) return;

    // Clear input
    if (!textToSend) setInputText('');

    // Add user message
    const userMsg = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText, mode })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Offline mock response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: 'Sorry, I am facing network configuration issues connecting to the core model. However, you can refer to the Beginner Guide tab for syllabus flowcharts, or download NCERT PDFs in the Resources tab!'
        }]);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">AI Study Assistant</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
          Your personal UPSC preparation mentor. Ask questions about syllabus subjects, attempts, and study tactics.
        </p>
      </div>

      {/* Mode Selector Panel */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { id: 'mentor', label: 'UPSC Mentor' },
          { id: 'subject', label: 'Subject Help' },
          { id: 'planning', label: 'Study Planning' },
          { id: 'writing', label: 'Answer Writing' },
          { id: 'motivation', label: 'Motivation' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              mode === m.id
                ? 'bg-navy text-white border-navy shadow-md'
                : 'bg-white text-navy border-slate-200 hover:bg-slate-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-slate-200 rounded-3xl premium-shadow overflow-hidden flex flex-col h-[500px]">
        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => {
            const isBot = m.sender === 'bot';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] text-xs sm:text-sm ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div className={`p-2 rounded-xl text-white shrink-0 h-fit ${isBot ? 'bg-navy' : 'bg-saffron'}`}>
                  {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl border leading-relaxed whitespace-pre-line ${
                  isBot 
                    ? 'bg-white border-slate-200 text-navy font-medium' 
                    : 'bg-saffron text-white border-saffron font-semibold'
                }`}>
                  {m.text}
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex gap-3 mr-auto items-center text-xs text-slate-400 font-bold bg-white px-4 py-3 rounded-2xl border border-slate-200 w-fit">
              <Loader2 className="h-4 w-4 animate-spin text-navy" />
              <span>AI is thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap gap-2 justify-center bg-white">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p.text)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-navy font-bold text-[10px] rounded-full transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. standard geography books)..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-navy focus:border-navy focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 bg-navy hover:bg-navy-dark text-white rounded-xl transition-colors shadow"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
