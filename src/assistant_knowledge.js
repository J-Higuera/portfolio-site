/**
 * assistant_knowledge.js
 *
 * Structure:
 * - id: unique string (used for followups memory)
 * - keywords: phrases/words that should match this entry
 * - answer: short answer (first response)
 * - details: longer answer (when user asks "tell me more", "details", etc.)
 * - followups: suggested next questions
 *
 * Tip: Keep keywords broad (singular/plural, synonyms, abbreviations).
 */

export const QA = [
    // ============================================================
    // 0) HELLO / HELP / CAPABILITIES
    // ============================================================
    {
        id: "help",
        keywords: [
            "help", "what can you do", "options", "menu", "commands",
            "how does this work", "what should i ask", "what can i ask"
        ],
        answer:
            "I can answer questions about Juan’s projects, tech stack, strengths, roles he’s targeting, and contact info.\n\n" +
            "Try typing:\n" +
            "• projects\n" +
            "• tech stack\n" +
            "• strengths\n" +
            "• roles\n" +
            "• contact",
        details:
            "I’m a lightweight portfolio assistant (no paid API). I respond using Juan’s curated portfolio facts.\n\n" +
            "Popular questions:\n" +
            "• “What projects has Juan built?”\n" +
            "• “What’s the tech stack?”\n" +
            "• “What role is he looking for?”\n" +
            "• “How do I contact him?”\n\n" +
            "Tip: You can also ask “tell me more about <project name>”.",
        followups: ["projects", "tech stack", "roles", "contact"],
    },

    // ============================================================
    // 1) QUICK SUMMARY / ELEVATOR PITCH
    // ============================================================
    {
        id: "summary",
        keywords: [
            "summary", "overview", "tell me about juan", "about juan",
            "who is juan", "elevator pitch", "quick intro", "bio", "information about juan", "info"
        ],
        answer:
            "Juan is a web/software developer focused on building clean, deployable full-stack projects. " +
            "He emphasizes practical apps, solid fundamentals, and user-friendly UI.",
        details:
            "Quick overview:\n" +
            "• Focus: Full-stack web apps, clean UI, practical features\n" +
            "• Strengths: REST APIs, databases, frontend fundamentals, Git workflows\n" +
            "• Deployment: Netlify for hosting; Railway used for projects/databases (when needed)\n\n" +
            "Ask “projects” to see what he’s built.",
        followups: ["projects", "tech stack", "roles"],
    },

    // ============================================================
    // 2) PROJECTS - MASTER LIST
    // ============================================================
    {
        id: "projects",
        keywords: ["projects", "project", "portfolio", "apps", "built", "work", "what did you build"],
        answer:
            "Projects:\n" +
            "• AI Movie Assistant\n" +
            "• Port Scanner (WIP)\n" +
            "• Data Analyzer (WIP)\n" +
            "• Expense Tracker (WIP)\n\n" +
            "Try: “tell me more about AI Movie Assistant” or “details about Expense Tracker”.",
        details:
            "Here’s a deeper look (high level):\n\n" +
            "• AI Movie Assistant — movie discovery app focused on UI and practical features.\n" +
            "• Port Scanner (WIP) — networking/security-style tool focused on logic + reliability.\n" +
            "• Data Analyzer (WIP) — data processing + insights with clean outputs.\n" +
            "• Expense Tracker (WIP) — CRUD + validation + clean UX.\n\n" +
            "If you name a project, I can describe it in detail.",
        followups: [
            "tell me more about AI Movie Assistant",
            "tell me more about Port Scanner",
            "tell me more about Data Analyzer",
            "tell me more about Expense Tracker",
        ],
    },

    // ============================================================
    // 3) PROJECT: AI MOVIE ASSISTANT
    // ============================================================
    {
        id: "ai_movie_assistant",
        keywords: [
            "ai movie assistant", "movie assistant", "movies", "film app",
            "movie project", "movie app", "ai movie"
        ],
        answer:
            "AI Movie Assistant is a movie discovery web app. Ask “features” or “tech stack” to go deeper.",
        details:
            "AI Movie Assistant (details):\n" +
            "• What it is: Movie discovery/assistant-style web app.\n" +
            "• What it demonstrates: UI structure, interactive features, clean project organization.\n\n" +
            "TODO (fill these to make it impressive):\n" +
            "• Data source/API used: (TMDB? OMDb? custom DB?)\n" +
            "• Features: (search? filters? watchlist? recommendations?)\n" +
            "• Deployment: (Netlify? backend hosted where?)\n\n" +
            "Ask: “features of AI Movie Assistant” or “stack for AI Movie Assistant”.",
        followups: ["AI Movie Assistant features", "AI Movie Assistant tech stack", "AI Movie Assistant challenges"],
    },

    {
        id: "ai_movie_features",
        keywords: ["ai movie assistant features", "movie assistant features", "features", "what can it do", "functionality"],
        answer:
            "AI Movie Assistant includes a clean UI and movie discovery features (search/filter style).",
        details:
            "TODO: List the exact features you built so this doesn’t sound generic.\n\n" +
            "Examples you might include (only keep the ones you actually have):\n" +
            "• Search by title/keyword\n" +
            "• Filter by genre/year/rating\n" +
            "• Movie detail page\n" +
            "• Favorites/watchlist\n" +
            "• Responsive layout\n" +
            "• Error/loading states",
        followups: ["AI Movie Assistant tech stack", "AI Movie Assistant deployment"],
    },

    // ============================================================
    // 4) PROJECT: PORT SCANNER (WIP)
    // ============================================================
    {
        id: "port_scanner",
        keywords: [
            "port scanner", "scanner", "ports", "network scanner",
            "cyber", "cybersecurity project", "security tool", "wip port scanner"
        ],
        answer:
            "Port Scanner (WIP) is a networking/security-style tool focused on core logic and reliability.",
        details:
            "Port Scanner (details):\n" +
            "TODO: Fill in what’s real:\n" +
            "• Language: (Python? Node? C? )\n" +
            "• Mode: (CLI? web UI? both?)\n" +
            "• Capabilities: (TCP connect scan? range scanning? concurrency?)\n" +
            "• What it demonstrates: networking fundamentals, performance considerations, clean code\n\n" +
            "Ask: “what does the port scanner do?” or “what did you learn building it?”",
        followups: ["Port Scanner tech stack", "Port Scanner features", "Port Scanner status"],
    },

    // ============================================================
    // 5) PROJECT: DATA ANALYZER (WIP)
    // ============================================================
    {
        id: "data_analyzer",
        keywords: ["data analyzer", "data analysis", "analyzer", "data project", "wip data analyzer", "analytics"],
        answer:
            "Data Analyzer (WIP) focuses on processing real data and producing clear outputs/insights.",
        details:
            "Data Analyzer (details):\n" +
            "TODO: Specify what it actually does:\n" +
            "• Input: (CSV upload? DB? API?)\n" +
            "• Output: (charts? summary stats? dashboards?)\n" +
            "• Tech: (Python? JS? libraries?)\n\n" +
            "Ask: “what problem does it solve?” or “what’s the planned feature list?”",
        followups: ["Data Analyzer tech stack", "Data Analyzer features", "Data Analyzer roadmap"],
    },

    // ============================================================
    // 6) PROJECT: EXPENSE TRACKER (WIP)
    // ============================================================
    {
        id: "expense_tracker",
        keywords: ["expense tracker", "expenses", "budget app", "finance tracker", "wip expense tracker"],
        answer:
            "Expense Tracker (WIP) is a CRUD-style personal finance tracker emphasizing validation and clean UX.",
        details:
            "Expense Tracker (details):\n" +
            "TODO: Confirm what you built/planned:\n" +
            "• Auth: (login? sessions? JWT?)\n" +
            "• Core: add/edit/delete expenses, categories, summaries\n" +
            "• Storage: (PostgreSQL? MySQL? local storage?)\n" +
            "• Deployment: (Netlify + backend?)\n\n" +
            "Ask: “what features does the expense tracker have?”",
        followups: ["Expense Tracker features", "Expense Tracker tech stack", "Expense Tracker status"],
    },

    // ============================================================
    // 7) TECH STACK (GENERAL)
    // ============================================================
    {
        id: "tech_stack",
        keywords: [
            "tech stack", "stack", "technologies", "tools", "languages",
            "frontend", "backend", "database", "deployment", "hosting",
            "html", "css", "javascript", "node", "flask", "python",
            "postgresql", "mysql", "git", "github", "netlify", "railway"
        ],
        answer:
            "Juan’s stack: HTML/CSS/JavaScript on the frontend, Flask/Node for APIs, PostgreSQL/MySQL for data, Git/GitHub for version control, Netlify for hosting, and Railway used for some project infrastructure.",
        details:
            "Stack breakdown:\n" +
            "• Frontend: HTML, CSS, JavaScript\n" +
            "• Backend/APIs: Flask + Node (depending on project)\n" +
            "• Databases: PostgreSQL, MySQL\n" +
            "• Tooling: Git/GitHub\n" +
            "• Deployment: Netlify for the portfolio; Railway used for databases/projects when needed\n\n" +
            "TODO: Add specifics (frameworks, auth, testing, CI, etc.) once confirmed.",
        followups: ["frontend", "backend", "database", "deployment"],
    },

    // ============================================================
    // 8) STRENGTHS / SKILLS
    // ============================================================
    {
        id: "strengths",
        keywords: ["strengths", "skills", "core strengths", "what are you good at", "what can you do", "expertise"],
        answer:
            "Core strengths: REST API design/implementation, full-stack development, Git workflows, debugging/performance optimization, and usability-focused UI work.",
        details:
            "Juan’s strengths (from his portfolio):\n" +
            "• REST API design & implementation (Flask/Node)\n" +
            "• Full-stack app development\n" +
            "• Git-based workflows & version control\n" +
            "• Debugging & performance optimization\n" +
            "• Focus on performance & usability\n\n" +
            "Ask: “projects” to see how these show up in real work.",
        followups: ["projects", "tech stack", "deployment"],
    },

    // ============================================================
    // 9) ROLES / JOB TARGET
    // ============================================================
    {
        id: "roles",
        keywords: ["roles", "role", "job", "what roles", "position", "hire", "employment", "looking for", "open to"],
        answer:
            "Juan is targeting web/software developer roles—especially positions where he can build real-world full-stack web applications.",
        details:
            "TODO: Confirm exactly what roles you want listed.\n\n" +
            "Common options (pick the ones that are true):\n" +
            "• Junior Software Developer\n" +
            "• Web Developer / Frontend Developer\n" +
            "• Full-Stack Developer\n" +
            "• Backend Developer (APIs)\n\n" +
            "Also add: location preference, remote/hybrid, and work authorization (optional).",
        followups: ["contact", "tech stack", "projects"],
    },

    // ============================================================
    // 10) CONTACT INFO
    // ============================================================
    {
        id: "contact",
        keywords: ["contact", "email", "reach", "message", "linkedin", "github", "how to contact", "get in touch"],
        answer:
            "You can contact Juan via the contact form on this site, or through LinkedIn/GitHub (linked on the page).",
        details:
            "Contact options:\n" +
            "• Site contact form\n" +
            "• LinkedIn (icon link)\n" +
            "• GitHub (icon link)\n\n" +
            "TODO: Add exact email and LinkedIn URL if you want them explicitly displayed here.",
        followups: ["roles", "projects"],
    },

    // ============================================================
    // 11) LOCATION / AVAILABILITY (OPTIONAL)
    // ============================================================
    {
        id: "location",
        keywords: ["location", "where", "based", "city", "state", "timezone", "ontario", "california"],
        answer:
            "Juan is based in Ontario, California, USA.",
        details:
            "Location: Ontario, California.\n\n" +
            "TODO: Add whether you’re open to remote/hybrid/on-site and which areas you’re targeting.",
        followups: ["roles", "contact"],
    },

    // ============================================================
    // 12) EDUCATION / CERTS (KEEP IT SIMPLE)
    // ============================================================
    {
        id: "education",
        keywords: ["education", "degree", "school", "college", "certification", "certifications", "certs"],
        answer:
            "Education: Associate’s Degree in Computer Information Systems + Web Developer certification(s).",
        details:
            "TODO: Fill in exact school name(s), graduation year, and specific cert titles.\n\n" +
            "Keep it short, factual, and employer-friendly.",
        followups: ["tech stack", "projects"],
    },
];
