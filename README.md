# 📘 App Dev Lab Project — Repository Overview

A **React + Vite** web application for librarians to monitor and manage new book acquisition records, backed by **Supabase** for authentication and data storage.

---

## 👥 Contributors

| Name | GitHub |
|---|---|
| Felipe M. Panugan III | NeoRedcraft |
| Nicholas Rian D. Pastiu | yikkN |
| Karrin Frida Novero | Rin1803 |
| Dwayne Umali | RDwayneUmali |
| Jacob Shen Riesgo | JacobShenRiesgo |

---

## 📄 File Description:

<pre>
📂 App_dev_lab-project/ (Root)
├── 📄 README.md
│     ↳ Lists contributors and provides a high-level project overview
├── 📄 package-lock.json
│     ↳ Auto-generated lockfile ensuring consistent dependency versions across installs
├── 📁 .vscode/
│     ↳ Editor settings for VS Code (workspace-specific configs)
├── 📁 proj-docs/
│     ↳ All project documentation in one place
│     ├── 📄 component_documentation.md
│     │     ↳ Developer-oriented breakdown of each React component
│     ├── 📄 docker_guide.md
│     │     ↳ Instructions for containerizing and running the app with Docker
│     ├── 📄 debugging_empty_page_analysis.md
│     │     ↳ Documents the resolution of a runtime crash caused by a mismatched env variable name
│     ├── 📄 usertesting_securitylogin.md
│     │     ↳ Guide covering user testing, Supabase integration, and security features
│     └── 📄 User_Manual.md
│           ↳ End-user guide covering setup, login, and feature walkthroughs
└── 📁 my-app/ (Frontend Application)
      ↳ The main React application directory
      ├── 📄 package.json
      │     ↳ Manages dependencies (React, Supabase client, etc.) and npm scripts
      ├── 📄 vite.config.ts
      │     ↳ Configuration file for the Vite build tool
      ├── 📄 .gitignore
      │     ↳ Tells Git to ignore files like node_modules and .env
      ├── 📄 index.html
      │     ↳ The root HTML entry point that loads the React app
      └── 📁 src/ (Source Code)
            ├── 📄 main.tsx
            │     ↳ React entry point — mounts the App component into index.html
            ├── 📄 App.tsx
            │     ↳ Root component handling top-level routing and login state
            └── 📁 components/ (Feature Modules)
                  ├── 📁 Login/
                  │     ↳ Self-contained login module
                  │     ├── LoginPage.tsx     — Login form UI with Supabase auth logic
                  │     ├── Login.css         — Form layout and responsive styles
                  │     └── supabaseClient.ts — Exports the configured Supabase client
                  ├── 📁 Dashboard/
                  │     ↳ Main hub shown after a successful login
                  │     ├── Dashboard.tsx     — Navigation links to all major sections
                  │     └── Dashboard.css     — Styles for panels, cards, and grid layout
                  ├── 📁 Editing/
                  │     ↳ Interfaces for modifying existing records
                  │     ├── Editing.tsx       — Form-driven component for editing backend entries
                  │     └── Editing.css       — Styles for form layout and error messages
                  ├── 📁 Editions/
                  │     ↳ Lists and manages different editions (e.g. academic years)
                  │     ├── Editions.tsx      — Table/list view with filter and search controls
                  │     └── Edition.css       — Styles for list rows, headers, and pagination
                  ├── 📁 ProgramCourse/
                  │     ↳ Handles program/course display and print templates
                  │     ├── ProgramCourse.tsx         — Renders course details for screen and print
                  │     ├── ProgramCourse.css         — Card layouts and print-friendly formatting
                  │     └── coursePrintTemplate.ts    — Generates a print-ready HTML template for course info
                  ├── 📁 ReportSummary/
                  │     ↳ Generates and displays report summaries
                  │     ├── ReportSummary.tsx              — Input criteria, summary display, and export options
                  │     ├── ReportSummary.css              — Styles for summary tables, charts, and print views
                  │     └── reportSummaryPrintTemplate.ts  — Generates a print-ready template for reports
                  └── 📁 BooksEncoding/
                        ↳ Tool for encoding and transforming book/resource data
                        ├── BooksEncoding.tsx  — Inputs and logic for bulk encoding of book identifiers
                        └── BooksEncoding.css  — Styles for the encoding tool's UI controls
</pre>

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| React + TypeScript | Frontend UI framework |
| Vite | Build tool and dev server |
| Supabase | Authentication and backend database |
| CSS Modules | Component-scoped styling |
| Docker | Optional containerized deployment |

---

## 🚀 Getting Started

```bash
# Install dependencies
cd my-app
npm install

# Start the development server
npm run dev
```

> Refer to `proj-docs/User_Manual.md` for full setup instructions, and `proj-docs/docker_guide.md` to run the app via Docker.
