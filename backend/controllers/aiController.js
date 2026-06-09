const https = require('https');

function callGemini(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0]) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('Invalid response from Gemini: ' + body));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

exports.chat = async (req, res) => {
  const { message, mode } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message.' });
  }

  const query = message.toLowerCase();
  const activeMode = mode || 'mentor';

  // If Gemini API Key exists, use real Gemini!
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      let systemPrompt = "You are BeginUPSC AI Assistant, a professional mentor for UPSC civil services aspirants in India.\n";
      if (activeMode === 'mentor') {
        systemPrompt += "Provide overall guidance, syllabus insights, attempts/age rules, and general civil services strategies.\n";
      } else if (activeMode === 'subject') {
        systemPrompt += "Provide deep subject-specific educational help. Focus on core definitions, textbook references, and explaining concepts simply.\n";
      } else if (activeMode === 'planning') {
        systemPrompt += "Act as a study scheduler. Suggest study timings, book budgets, and daily targets matching the user's bandwidth.\n";
      } else if (activeMode === 'writing') {
        systemPrompt += "Provide answer writing guidance. Help structure GS answers (Introduction, Body with points, Conclusion) and suggest map/diagram inclusions.\n";
      } else if (activeMode === 'motivation') {
        systemPrompt += "Act as a motivational support guide. Keep messages encouraging, suggest discipline strategies, quote inspiring stories of toppers, and help combat anxiety.\n";
      }
      systemPrompt += `User query: "${message}"\nResponse:`;
      const reply = await callGemini(systemPrompt, apiKey);
      return res.json({ reply });
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local engine:", err.message);
    }
  }

  // Local rule-based engine fallback
  let reply = '';
  if (activeMode === 'motivation') {
    const quotes = [
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "The service of India means the service of the millions who suffer. - Jawaharlal Nehru"
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    reply = `[Motivation Mode Enabled]\nKeep moving forward! Here is your UPSC daily reminder:\n\n"${quote}"\n\nTips to stay consistent:\n1. Maintain your study streak on your BeginUPSC dashboard.\n2. Divide your syllabus into micro-tasks.\n3. Remember why you started this journey: to serve the nation and bring positive changes on the ground!`;
  } else if (activeMode === 'writing') {
    reply = `[Answer Writing Mode Enabled]
Here is a standard structure to secure maximum marks in UPSC Mains General Studies papers:
1. **Introduction (10-15% of words)**: Define the core term in the question or provide a relevant current statistic.
2. **Body (70-80% of words)**: Divide into subheadings. Use bullet points rather than long paragraphs. Ensure you cover both pros/cons or multiple facets of the issue. Use schematics or map drawings for visual clarity.
3. **Conclusion (10-15% of words)**: End with a positive, forward-looking, and constructive solution. Quote government initiatives or constitutional values.

For example, when writing about federalism, start with constitutional articles (Article 1), discuss cooperative federalism mechanisms (GST council, NITI Aayog), and conclude with the way forward.`;
  } else if (activeMode === 'planning') {
    reply = `[Study Planner Mode Enabled]
To draft a productive preparation plan:
1. **Full-Time Candidates**: Dedicate 8-10 hours daily. Split: 3 hours for core GS subject, 2 hours for Optional, 2 hours for current affairs/editorials, and 1 hour for revisions/MCQs.
2. **Working Professionals & Students**: Allocate 3-4 hours on weekdays. Spend 1 hour on newspaper briefs and 2.5 hours on core subjects. Maximize weekends to 8-10 hours.
Remember to align your progress inside the "Study Roadmaps" configurator tab!`;
  } else if (activeMode === 'subject') {
    if (query.includes('polity') || query.includes('constitution')) {
      reply = `[Subject Help: Polity]
Essential Polity key focus areas:
- **Fundamental Rights (Part III, Articles 12-35)**: Understand the exceptions to each right and Supreme Court writ powers under Article 32.
- **Panchayati Raj**: 73rd and 74th Amendment Acts. Understand devolution of power and funding structures.
- **Constitutional Bodies**: Election Commission, CAG, UPSC, Finance Commission.
Rely on M. Laxmikanth and NCERT Class 11 "Indian Constitution at Work".`;
    } else if (query.includes('history') || query.includes('national movement')) {
      reply = `[Subject Help: History]
Chronological breakdown of Modern Indian History (1750-1947):
1. **1857 Revolt**: Causes, key centers (Delhi, Jhansi, Kanpur), leaders, and consequences (Government of India Act 1858).
2. **Moderate Phase (1885-1905)**: Economic critique of British rule (Dadabhai Naoroji's Drain Theory).
3. **Extremist Phase (1905-1919)**: Swadeshi movement, Home Rule leagues.
4. **Gandhian Era (1919-1947)**: Non-Cooperation, Civil Disobedience (Salt Satyagraha), and Quit India movements.
Rely on Spectrum or Bipin Chandra books.`;
    } else if (query.includes('economy') || query.includes('monetary') || query.includes('inflation')) {
      reply = `[Subject Help: Economy]
Core economics concepts to master:
- **Monetary Policy**: repo rate, SLR, CRR. Know how RBI manages liquidity to control inflation (target 4% +/- 2%).
- **Fiscal Policy**: Capital vs Revenue budget deficits, taxation, and FRBM guidelines.
- **Balance of Payments**: Current account deficit, trade surplus, foreign reserves.
Follow standard Ramesh Singh textbook and the annual Economic Survey summary notes.`;
    } else {
      reply = `[Subject Help Mode Enabled]
Which of the 12 UPSC subjects would you like help with?
- History, Geography, Polity, Economy, Environment, Science & Technology, Ethics, Art & Culture, etc.
Ask me about standard books list or specific topics (e.g. 'tell me about green hydrogen mission').`;
    }
  } else {
    // General Mentor mode
    if (query.includes('syllabus') || query.includes('pattern')) {
      reply = `[UPSC Mentor Mode]
The UPSC CSE exam pattern consists of:
1. **Prelims (Objective)**: Qualifying stage.
   - Paper I: General Studies (100 MCQs, 200 Marks) - determines merit cutoff.
   - Paper II: CSAT (80 MCQs, 200 Marks) - qualifying at 33% (66 marks).
2. **Mains (Written Descriptive)**: Determines ranking.
   - 1 Essay Paper (250 Marks)
   - 4 General Studies Papers (GS 1, 2, 3, 4 - 250 Marks each)
   - 2 Optional Papers (250 Marks each)
   - 2 Language Papers (Qualifying only)
3. **Interview (Personality Test)**: 275 Marks.`;
    } else if (query.includes('age') || query.includes('attempts') || query.includes('limit')) {
      reply = `[UPSC Mentor Mode]
UPSC eligibility guidelines:
- **General Category**: Limit of 6 attempts, up to 32 years of age.
- **OBC Category**: Limit of 9 attempts, up to 35 years of age.
- **SC/ST Category**: Unlimited attempts, up to 37 years of age.
- **PwD Category**: Limit of 9 attempts, up to 42 years of age.
Minimum age limit for all candidates is 21 years on August 1st of the exam year.`;
    } else {
      reply = `[UPSC Mentor Mode]
Hello! I am your BeginUPSC AI Mentor. I can guide you through syllabus analysis, book recommendation checklists, eligibility calculator steps, and motivational topper outlines.
Feel free to ask questions like:
- "What is the pattern of the Prelims exam?"
- "Explain the difference between IAS and IPS."
- "Show me standard NCERT checklist."`;
    }
  }

  setTimeout(() => {
    res.json({ reply });
  }, 400);
};
