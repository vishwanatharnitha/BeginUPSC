const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

let dbType = 'sqlite';
let mysqlPool = null;
let sqliteConn = null;

async function initDb() {
  const useMysql = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

  if (useMysql) {
    try {
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test connection
      const conn = await mysqlPool.getConnection();
      console.log('Successfully connected to MySQL database.');
      conn.release();
      dbType = 'mysql';
    } catch (err) {
      console.warn('MySQL connection failed. Falling back to SQLite3. Error:', err.message);
      setupSqlite();
    }
  } else {
    console.log('No MySQL config found in environment. Initializing SQLite3 database.');
    setupSqlite();
  }

  // Load and execute schema
  await executeSchema();
}

function setupSqlite() {
  dbType = 'sqlite';
  try {
    const sqlite3 = require('sqlite3').verbose();
    // Use /tmp directory if running under Vercel serverless environment (read-only filesystem)
    const dbDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..');
    const dbPath = path.join(dbDir, 'begin_upsc.sqlite');
    console.log(`[DATABASE] Setting up SQLite at path: ${dbPath}`);
    
    sqliteConn = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DATABASE] Failed to create SQLite database:', err.message);
      } else {
        console.log('[DATABASE] Connected to SQLite database at:', dbPath);
      }
    });
  } catch (err) {
    console.error('[DATABASE CRITICAL] Failed to load sqlite3 module on Vercel serverless:', err.message);
    console.warn('[DATABASE] Falling back to memory-mock database queries to prevent process crash. Persistent database requires MySQL configuration on Vercel.');
    sqliteConn = {
      all: (sql, params, callback) => {
        console.warn('[DATABASE MOCK] Intercepted sqliteConn.all query:', sql);
        callback(null, []);
      },
      run: function(sql, params, callback) {
        console.warn('[DATABASE MOCK] Intercepted sqliteConn.run query:', sql);
        callback.call({ lastID: 1, changes: 0 }, null);
      }
    };
  }
}

async function query(sql, params = []) {
  if (dbType === 'mysql') {
    try {
      const [results] = await mysqlPool.execute(sql, params);
      return results;
    } catch (err) {
      console.error('MySQL Query Error:', err.message, '\nSQL:', sql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      let formattedSql = sql;
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

      if (isSelect) {
        sqliteConn.all(formattedSql, params, (err, rows) => {
          if (err) {
            console.error('SQLite Query Error:', err.message, '\nSQL:', sql);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } else {
        sqliteConn.run(formattedSql, params, function (err) {
          if (err) {
            console.error('SQLite Execute Error:', err.message, '\nSQL:', sql);
            reject(err);
          } else {
            resolve({
              insertId: this.lastID,
              affectedRows: this.changes
            });
          }
        });
      }
    });
  }
}

async function executeSchema() {
  try {
    const filename = dbType === 'sqlite' ? 'schema.sqlite.sql' : 'schema.sql';
    let schemaPath = path.join(__dirname, '..', 'database', filename);
    
    // Fallback paths for Vercel bundling and workspace path variants
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(process.cwd(), 'backend', 'database', filename);
    }
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(process.cwd(), 'database', filename);
    }
    
    if (!fs.existsSync(schemaPath)) {
      console.warn(`[DATABASE] Schema file not found at any resolved path (checked: ${path.join(__dirname, '..', 'database', filename)} and ${path.join(process.cwd(), 'backend', 'database', filename)}).`);
      return;
    }

    console.log(`[DATABASE] Executing schema file from path: ${schemaPath}`);

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split queries by semicolon and execute them sequentially
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .filter(q => {
        const upper = q.toUpperCase();
        // Skip database creation and selection statements since connection pool manages it
        const shouldSkip = upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ');
        if (shouldSkip) {
          console.log(`[DATABASE] Skipping query (managed by connection pool): ${q}`);
        }
        return !shouldSkip;
      });

    for (const q of queries) {
      try {
        await query(q);
      } catch (err) {
        // Suppress table exists errors
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.warn('Non-critical schema init warning:', err.message, 'Query was:', q);
        }
      }
    }
    console.log(`Database schema (${dbType}) initialization completed.`);
    
    // Seed initial data
    await seedInitialData();
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

async function seedInitialData() {
  try {
    // Check if the database has already been seeded with the upgraded 12 subjects
    const targetProductionCheck = await query("SELECT count(*) as count FROM subjects WHERE name = 'Disaster Management'");
    const countNew = targetProductionCheck[0] ? (targetProductionCheck[0].count || targetProductionCheck[0]['COUNT(*)'] || 0) : 0;

    if (countNew > 0) {
      console.log("Database already seeded with production UPSC content. Skipping seeding.");
      return;
    }

    console.log("Upgrading database to production UPSC content...");
    
    // Clear old tables in correct foreign key order
    try {
      await query('DELETE FROM progress');
      await query('DELETE FROM topics');
      await query('DELETE FROM results');
      await query('DELETE FROM questions');
      await query('DELETE FROM tests');
      await query('DELETE FROM comments');
      await query('DELETE FROM forum_posts');
      await query('DELETE FROM feedback');
      await query('DELETE FROM notifications');
      await query('DELETE FROM achievements');
      await query('DELETE FROM profiles');
      await query('DELETE FROM users');
      await query('DELETE FROM current_affairs');
      await query('DELETE FROM resources');
      await query('DELETE FROM roadmaps');
    } catch (e) {
      console.warn("Table cleanup warnings (non-critical):", e.message);
    }

    console.log('Seeding initial production-grade UPSC preparation data...');

    // 1. Seed the 12 specific UPSC subjects
    const subjects = [
      ['History', 'Modern Indian History, Ancient & Medieval History, and World History.', 'both'],
      ['Geography', 'Physical, Economic, and Social Geography of India and the World.', 'both'],
      ['Polity', 'Indian Constitution, Political System, Governance, and Panchayati Raj.', 'both'],
      ['Economy', 'Economic Development, National Income, Fiscal & Monetary Policies, and Budgets.', 'both'],
      ['Environment', 'Ecology, Biodiversity, Climate Change, and Environmental Legislation.', 'both'],
      ['Science & Technology', 'Developments in space, IT, biotechnology, defense, and nanotechnology.', 'both'],
      ['Ethics', 'Ethics, Integrity, Aptitude, moral philosophies, and public service values.', 'mains'],
      ['International Relations', 'India\'s foreign relations, bilateral ties, and multilateral groupings.', 'mains'],
      ['Art & Culture', 'Indian art forms, literature, architecture, and performing arts.', 'both'],
      ['Agriculture', 'Farming systems, cropping patterns, agricultural economics, and land reforms.', 'both'],
      ['Internal Security', 'Security challenges, cyber security, money laundering, and extremism.', 'mains'],
      ['Disaster Management', 'Natural and man-made disasters, NDMA guidelines, and hazard mitigation.', 'mains']
    ];

    for (const sub of subjects) {
      await query('INSERT INTO subjects (name, description, category) VALUES (?, ?, ?)', sub);
    }

    const subjectsRows = await query('SELECT id, name FROM subjects');
    const subjectMap = {};
    subjectsRows.forEach(s => {
      subjectMap[s.name] = s.id;
    });

    // Helper to generate rich notes HTML for each subject
    const generateNotesHtml = (subjectName, chapterNum) => {
      return `<h3>Syllabus & Chapters</h3>
<p>Official UPSC syllabus checklist details for ${subjectName} - Chapter ${chapterNum}.</p>
<ul>
  <li>Section A: Foundational Theories and Frameworks</li>
  <li>Section B: Key Institutions and Historical Milestones</li>
  <li>Section C: Contemporary Developments and Dynamic Linkages</li>
</ul>

<h3>Core Concepts & Notes</h3>
<p>Comprehensive subject summary notes covering essential themes and standard textbooks:</p>
<blockquote class="bg-slate-50 border-l-4 border-navy p-3 my-2 text-xs italic">
  "Mastering ${subjectName} requires linking core theoretical modules directly with daily editorial updates in the newspapers."
</blockquote>
<p>Ensure that you read the standard NCERT books from Class 6 to 12 as your starting point. Do not skip the basic definitions.</p>

<h3>Key Concepts</h3>
<ul>
  <li><strong>Active Recall:</strong> Summarize each paragraph in 3 keywords.</li>
  <li><strong>Institutional Framework:</strong> Focus on administrative structures and regulatory bodies.</li>
  <li><strong>Dynamic Interlinkage:</strong> Understand how policy changes impact ground realities.</li>
</ul>

<h3>Revision Notes</h3>
<p>High-yield facts and quick memory hooks for active recall before the examination:</p>
<ul>
  <li>Fact 1: Remember to quote specific committees and reports in your answers.</li>
  <li>Fact 2: Draw outline maps or schematics for visual representation where applicable.</li>
</ul>

<h3>PYQ References</h3>
<ul>
  <li><strong>Prelims 2024:</strong> Direct conceptual question from this chapter (2 Marks).</li>
  <li><strong>Mains 2023:</strong> 15-Mark descriptive analytical prompt in GS Paper (150 Words).</li>
</ul>

<h3>Important Facts</h3>
<p>Key statistical data points, index ranks, and constitutional articles to memorize for extra marks in the final evaluation.</p>`;
    };

    // 2. Seed Detailed Chapters and Topics for ALL 12 Subjects
    for (const subName of Object.keys(subjectMap)) {
      const subId = subjectMap[subName];
      const slug = subName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Topic 1: Foundations
      await query(`INSERT INTO topics (subject_id, name, description, notes_text, video_url, mind_map_url, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        subId,
        `${subName} Chapter 1: Comprehensive Foundations`,
        `Core concepts, standard definitions, and foundational checklist for ${subName}.`,
        generateNotesHtml(subName, 1),
        `https://www.youtube.com/watch?v=mock_${slug}_1`,
        `/mindmaps/${slug}_foundations.png`,
        `/resources/${slug}_foundations.pdf`
      ]);

      // Topic 2: High-Yield Revision Outline
      await query(`INSERT INTO topics (subject_id, name, description, notes_text, video_url, mind_map_url, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        subId,
        `${subName} Chapter 2: High-Yield Revision Outline`,
        `Revision summary, PYQs references, and important facts checklist for ${subName}.`,
        generateNotesHtml(subName, 2),
        `https://www.youtube.com/watch?v=mock_${slug}_2`,
        `/mindmaps/${slug}_revision.png`,
        `/resources/${slug}_revision.pdf`
      ]);
    }

    // 3. Seed 20 Roadmaps (4 Target Audiences * 5 Durations)
    const audiences = ['beginner', 'college_student', 'working_professional', 'full_time_aspirant'];
    const durations = [1, 3, 6, 12, 24];

    const generateWeeklyTasks = (aud, dur, weekNum) => {
      const tasks = [
        `Understand the UPSC Syllabus for this phase and cross-reference with standard book chapters.`,
        `Read NCERT books designated for the fundamental subject block.`,
        `Review the daily current affairs briefs and editorials on BeginUPSC.`,
        `Take a quick MCQ topic test at the end of the week.`
      ];
      return tasks;
    };

    const getAudienceLabel = (aud) => {
      return aud.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    for (const aud of audiences) {
      for (const dur of durations) {
        const title = `${dur} Month Plan for ${getAudienceLabel(aud)}`;
        
        // Generate weeks array based on duration (capping at 8 for readability in UI)
        const weeksCount = dur === 1 ? 4 : (dur === 3 ? 6 : 8);
        const weeks = [];
        for (let w = 1; w <= weeksCount; w++) {
          weeks.push({
            week: w,
            title: `Phase ${w}: Subject Focus & Consolidation`,
            tasks: generateWeeklyTasks(aud, dur, w)
          });
        }

        const studyHours = aud === 'working_professional' || aud === 'college_student' 
          ? '3-4 Hours daily (with 8-10 hours on weekends)' 
          : '8-10 Hours daily (highly disciplined approach)';

        const contentJson = {
          weeks,
          daily_targets: `Study core subjects for 2-3 hours. Analyze daily newspaper editorial columns (The Hindu or Indian Express) for 45 minutes. Take one short quiz. Target study hours: ${studyHours}.`,
          weekly_targets: `Complete at least 5 chapters of standard books. Attempt 1 topic-specific mock test on Sunday. Draft one GS practice answer.`,
          monthly_targets: `Finish one entire GS subject module. Solve 2 full-length mock papers. Review all bookmarked current affairs articles.`,
          subject_allocation: `Month 1-${Math.ceil(dur/4)}: Polity & History. Month ${Math.ceil(dur/4)+1}-${Math.ceil(2*dur/4)}: Geography & Economy. Month ${Math.ceil(2*dur/4)+1}-${Math.ceil(3*dur/4)}: Environment & S&T. Final Phase: Ethics, Revision, and Mock Exams.`,
          revision_strategy: `Follow the 3-Read revision rule. Initial read for understanding, second read to highlight keywords, third read to create micro-charts. Revise weekly notes every Sunday.`,
          test_strategy: `Start with topic-wise tests to check conceptual clarity. Move to subject-wise tests. Complete at least ${dur * 2} full-length prelims mocks before the actual exam.`,
          current_affairs_strategy: `Combine daily editorial reading with BeginUPSC's daily current affairs briefs. Rely on monthly compilations for consolidated revisions.`,
          book_recommendations: [
            `Indian Polity by M. Laxmikanth`,
            `Spectrum's Brief History of Modern India`,
            `Geography NCERTs Class 11 & 12`,
            `Indian Economy by Ramesh Singh or Sanjiv Verma`,
            `Environment notes by Shankar IAS`,
            `Lexicon for Ethics, Integrity & Aptitude`
          ],
          milestones: [
            `Syllabus checklist completion for core modules`,
            `Consolidation of basic NCERTs (Class 6-12)`,
            `Consistent mock test score of > 90/200`,
            `Optional subject selection and first-pass study completed`
          ]
        };

        await query(
          'INSERT INTO roadmaps (title, duration_months, target_audience, content_json) VALUES (?, ?, ?, ?)',
          [title, dur, aud, JSON.stringify(contentJson)]
        );
      }
    }

    // 4. Seed Mock Tests (Prelims Tests, Subject Tests, Full Length Tests)
    // Polity Test (Subject)
    const politySubId = subjectMap['Polity'] || null;
    await query(`INSERT INTO tests (subject_id, title, category, duration_minutes, total_marks) VALUES (?, ?, ?, ?, ?)`, [
      politySubId, 'Polity & Constitution Foundation Test', 'subject', 20, 20
    ]);
    const polityTestId = (await query('SELECT id FROM tests ORDER BY id DESC LIMIT 1'))[0]?.id;

    if (polityTestId) {
      const qList = [
        ['Which Article of the Indian Constitution guarantees the Right to Equality?', 'Article 12', 'Article 14', 'Article 19', 'Article 21', 'B', 'Article 14 guarantees equality before law and equal protection of laws to all persons within the territory of India.'],
        ['The Preamble to the Indian Constitution was amended by which Constitutional Amendment Act?', '42nd Amendment Act', '44th Amendment Act', '86th Amendment Act', '101st Amendment Act', 'A', 'The 42nd Amendment Act of 1976 added three terms: Socialist, Secular, and Integrity to the Preamble.'],
        ['The joint sitting of the two houses of the Indian Parliament is presided over by whom?', 'The President of India', 'The Vice-President of India', 'The Prime Minister of India', 'The Speaker of the Lok Sabha', 'D', 'According to Article 108, the joint sitting is convened by the President but presided over by the Speaker of the Lok Sabha.'],
        ['Which writ is issued by a high court or the Supreme Court to compel a public authority to perform a duty?', 'Habeas Corpus', 'Mandamus', 'Quo Warranto', 'Certiorari', 'B', 'Mandamus is a judicial remedy in the form of an order from a court to any government, court, corporation, or public authority, to do some specific act.'],
        ['The concept of Directive Principles of State Policy (DPSP) is borrowed from which country?', 'USA', 'USSR', 'Ireland', 'Australia', 'C', 'The Directive Principles of State Policy are borrowed from the Irish Constitution of 1937, which had copied it from the Spanish Constitution.']
      ];
      for (const q of qList) {
        await query(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [polityTestId, ...q]);
      }
    }

    // Economy Test (Subject)
    const economySubId = subjectMap['Economy'] || null;
    await query(`INSERT INTO tests (subject_id, title, category, duration_minutes, total_marks) VALUES (?, ?, ?, ?, ?)`, [
      economySubId, 'Indian Economy & Monetary Policy Test', 'subject', 20, 20
    ]);
    const economyTestId = (await query('SELECT id FROM tests ORDER BY id DESC LIMIT 1'))[0]?.id;

    if (economyTestId) {
      const qList = [
        ['What is the repo rate?', 'Rate at which commercial banks deposit funds with RBI', 'Rate at which RBI borrows money from commercial banks', 'Rate at which RBI lends money to commercial banks against government securities', 'Rate at which commercial banks lend to retail customers', 'C', 'Repo rate is the interest rate at which the central bank of India (RBI) lends money to commercial banks against government securities.'],
        ['Which of the following measurements is used to calculate national inflation in India?', 'Consumer Price Index (Combined)', 'Wholesale Price Index', 'GDP Deflator', 'Cost of Living Index', 'A', 'The Monetary Policy Committee of RBI uses the Consumer Price Index (CPI-Combined) as the key metric to measure inflation.'],
        ['Which curve represents the relationship between tax rates and tax revenues?', 'Phillips Curve', 'Laffer Curve', 'Lorenz Curve', 'Kuznets Curve', 'B', 'The Laffer Curve shows the relationship between tax rates and the amount of tax revenue collected by governments.'],
        ['The concept of Five-Year Plans in India was borrowed from which country?', 'USA', 'USSR', 'UK', 'France', 'B', 'The Five-Year Plans were conceptualized and borrowed from the Soviet Union (USSR), initiated by Joseph Stalin.'],
        ['What is the statutory liquidity ratio (SLR)?', 'Ratio of cash reserves commercial banks keep with RBI', 'Ratio of liquid assets commercial banks must hold in gold, cash, or government securities', 'Ratio of loans given to agricultural sector', 'Ratio of non-performing assets to total advances', 'B', 'SLR is the minimum percentage of deposits that a commercial bank has to maintain in the form of liquid cash, gold, or other securities.']
      ];
      for (const q of qList) {
        await query(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [economyTestId, ...q]);
      }
    }

    // Prelims Test (Prelims Mock)
    await query(`INSERT INTO tests (subject_id, title, category, duration_minutes, total_marks) VALUES (?, ?, ?, ?, ?)`, [
      null, 'UPSC CSE GS-I Prelims Mock Exam', 'mock', 30, 30
    ]);
    const mockTestId = (await query('SELECT id FROM tests ORDER BY id DESC LIMIT 1'))[0]?.id;

    if (mockTestId) {
      const qList = [
        ['Who presided over the 1916 Lucknow Session of the Indian National Congress?', 'Ambica Charan Mazumdar', 'Annie Besant', 'Madan Mohan Malaviya', 'Rash Behari Ghosh', 'A', 'The 1916 Lucknow Session was presided over by Ambica Charan Mazumdar. It is famous for the Lucknow Pact and reunion of Moderates and Extremists.'],
        ['Which of the following layers of the atmosphere contains the ozone layer?', 'Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere', 'B', 'The ozone layer is mainly found in the lower portion of the Stratosphere, which absorbs 97-99% of the Sun\'s medium-frequency ultraviolet light.'],
        ['The term "GDP" refers to the market value of:', 'All goods and services produced in an economy in a year', 'All final goods and services produced within a country in a given period', 'All intermediate goods and services produced in a year', 'All exports minus imports in a fiscal cycle', 'B', 'Gross Domestic Product (GDP) is the total market value of all final goods and services produced within a country\'s borders during a specific period.'],
        ['Which Constitutional Amendment Act added the Tenth Schedule (Anti-Defection Law)?', '42nd Amendment Act', '44th Amendment Act', '52nd Amendment Act', '91st Amendment Act', 'C', 'The 52nd Constitutional Amendment Act of 1985 added the Tenth Schedule, commonly referred to as the Anti-Defection Law.'],
        ['The Ramsar Convention is an international treaty for the conservation and sustainable use of:', 'Tropical Rainforests', 'Coral Reefs', 'Wetlands', 'Endangered Mammals', 'C', 'The Ramsar Convention is an international treaty signed in 1971 in Ramsar, Iran, for the conservation and sustainable use of wetlands.']
      ];
      for (const q of qList) {
        await query(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [mockTestId, ...q]);
      }
    }

    // Full Length Test
    await query(`INSERT INTO tests (subject_id, title, category, duration_minutes, total_marks) VALUES (?, ?, ?, ?, ?)`, [
      null, 'Full Length UPSC Prelims Practice Exam', 'mock', 60, 60
    ]);
    const fullTestId = (await query('SELECT id FROM tests ORDER BY id DESC LIMIT 1'))[0]?.id;

    if (fullTestId) {
      const qList = [
        ['Under which Article of the Constitution can the President declare a National Emergency?', 'Article 352', 'Article 356', 'Article 360', 'Article 368', 'A', 'Article 352 allows the President to declare a National Emergency on the grounds of war, external aggression, or armed rebellion.'],
        ['Which river is known as the "Sorrow of Bengal"?', 'Ganga River', 'Damodar River', 'Kosi River', 'Hooghly River', 'B', 'Damodar River was formerly known as the "Sorrow of Bengal" due to its devastating floods in the plains of Bengal.'],
        ['Who was the first Governor-General of Bengal?', 'Robert Clive', 'Warren Hastings', 'Lord Cornwallis', 'Lord William Bentinck', 'B', 'The Regulating Act of 1773 designated the Governor of Bengal as the Governor-General of Bengal, and Warren Hastings was the first.'],
        ['The biological magnification refers to the increase in concentration of:', 'Nutrients in a water body', 'Toxic chemicals at successive trophic levels', 'Oxygen level in high altitudes', 'Carbon dioxide in urban regions', 'B', 'Biomagnification is the increasing concentration of a substance, such as a toxic chemical, in the tissues of tolerant organisms at successively higher levels in a food chain.'],
        ['Which of the following is NOT a member of the G20?', 'Argentina', 'South Africa', 'Switzerland', 'Turkey', 'C', 'Switzerland is not a member of the G20, although it participates in some working groups.']
      ];
      for (const q of qList) {
        await query(`INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [fullTestId, ...q]);
      }
    }

    // 5. Seed Resources
    const resourcesList = [
      ['UPSC CSE Official Notification and Syllabus Checklist', 'syllabus', '/resources/upsc_syllabus.pdf'],
      ['Class 6 NCERT History - Our Pasts I', 'ncert', '/resources/ncert_hist_6.pdf'],
      ['Class 11 NCERT Polity - Indian Constitution at Work', 'ncert', '/resources/ncert_pol_11.pdf'],
      ['Class 11 NCERT Geography - India: Physical Environment', 'ncert', '/resources/ncert_geo_11.pdf'],
      ['Indian Polity by M. Laxmikanth (Chapter Index & Focus Guide)', 'ncert', '/resources/laxmikanth_guide.pdf'],
      ['A Brief History of Modern India by Spectrum (Revision Outlines)', 'ncert', '/resources/spectrum_outlines.pdf'],
      ['NITI Aayog Strategy for New India @ 75 Report', 'report', '/resources/niti_75_report.pdf'],
      ['2nd Administrative Reforms Commission (ARC) Report Summary', 'report', '/resources/arc_report_summary.pdf'],
      ['PIB Monthly Policy Compilations - May 2026', 'ncert', '/resources/pib_may_2026.pdf'],
      ['Yojana Magazine: Green Energy Transition Digest', 'ncert', '/resources/yojana_green_energy.pdf'],
      ['Mains General Studies Answer Writing Template Booklet', 'ncert', '/resources/answer_writing_booklet.pdf']
    ];

    for (const res of resourcesList) {
      await query('INSERT INTO resources (title, category, pdf_url) VALUES (?, ?, ?)', res);
    }

    // 6. Seed Current Affairs
    const affairsList = [
      ['National Green Hydrogen Mission Expansion Approved', 'National', 'The government has approved an additional incentive budget for setting up green hydrogen hubs in coastal states. It targets a production of 5 MMT of green hydrogen annually by 2030.', '2026-06-08', '/current_affairs/green_hydrogen.pdf'],
      ['Indo-Pacific Economic Framework (IPEF) Ministerial Talks', 'International', 'Ministers from 14 partner nations gathered to discuss clean energy transits, supply chain agreements, anti-corruption transparency, and fair economy initiatives.', '2026-06-07', '/current_affairs/ipef_talks.pdf'],
      ['Monetary Policy Committee Maintains Repo Rate at 6.5%', 'Economy', 'The RBI Monetary Policy Committee voted to keep the policy repo rate unchanged, stating focus remains on aligning inflation targets to 4%.', '2026-06-09', '/current_affairs/rbi_mpc.pdf'],
      ['ISRO Schedules Launch of Gaganyaan Test Vehicle', 'Science', 'ISRO announced the launch timeline for the next test vehicle abort mission (TV-D2) to validate safety recovery parachutes for the manned space flight.', '2026-06-06', '/current_affairs/gaganyaan.pdf']
    ];

    for (const aff of affairsList) {
      await query('INSERT INTO current_affairs (title, category, content, published_date, pdf_url) VALUES (?, ?, ?, ?, ?)', aff);
    }

    // 7. Seed Admin Default User
    const salt = await require('bcryptjs').genSalt(10);
    const adminPasswordHash = await require('bcryptjs').hash('admin123', salt);
    const userResult = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@beginupsc.com', adminPasswordHash, 'admin']
    );
    const adminId = userResult.insertId;
    
    await query(
      'INSERT INTO profiles (user_id, full_name, age, category, nationality, graduation_status, points, level, current_streak, last_active_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [adminId, 'Admin Master', 28, 'general', 'Indian', 'completed', 0, 1, 0, null]
    );

    // 8. Seed Student Default User
    const studentPasswordHash = await require('bcryptjs').hash('student123', salt);
    const studentResult = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['student', 'student@beginupsc.com', studentPasswordHash, 'student']
    );
    const studentId = studentResult.insertId;

    await query(
      'INSERT INTO profiles (user_id, full_name, age, category, nationality, graduation_status, points, level, current_streak, last_active_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, 'Sample Aspirant', 22, 'general', 'Indian', 'completed', 100, 2, 2, '2026-06-08']
    );
    await query(
      'INSERT INTO achievements (user_id, title, description, badge_icon) VALUES (?, ?, ?, ?)',
      [studentId, 'Syllabus Explorer', 'Read and completed first study topic notes.', '📚']
    );

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Failed to seed initial data:', err.message);
  }
}

module.exports = {
  initDb,
  query,
  getDbType: () => dbType
};
