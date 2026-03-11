# Contributors:
* Felipe M. Panugan III - NeoRedcraft
* Nicholas Rian D. Pastiu - yikkN
* Karrin Frida Novero - Rin1803
* Dwayne Umali - RDwayneUmali
* Jacob Shen Riesgo - JacobShenRiesgo


# Project Structure Overview

This project is a React-based web application initialized with Vite, using Supabase for authentication.

## File and Folder Breakdown

### `App_dev_lab-project` (Root)
- **README.md**: Contains the list of contributors and this project overview.
- **proj-docs/**: Documentation directory.
  - `usertesting_securitylogin.md`: Detailed guide on user testing, Supabase integration, and security features.
  - `debugging_empty_page_analysis.md` : Documented on resolving a runtime crash from a mismatched env name.

### `my-app` (Frontend Application)
This is the main directory for the React application.
- **package.json**: Manages project dependencies (React, Supabase client, etc.) and scripts (`npm run dev`).
- **vite.config.ts**: Configuration for the Vite build tool.
- **.gitignore**: Specifies which files Git should ignore (e.g., `node_modules`, `.env`).
- **index.html**: The main entry point HTML file.

#### `src/` (Source Code)
- **main.tsx**: The entry point for React. It finds the root element in `index.html` and renders the `App`.
- **App.tsx**: The root component. It currently handles rendering the `LoginPage` and performs high‑level routing once the user is authenticated.
- **components/**: Contains modular React components grouped by feature. Each folder typically contains a `.tsx` view, a `.css` stylesheet, and any helper files.
  - **Login/**: Self-contained login module.
    - `LoginPage.tsx`: The UI and logic for the login form, including field validation and Supabase authentication flows (sign‑in, sign‑out, error handling).
    - `Login.css`: Dedicated styles for form layout and responsive behaviour.
    - `supabaseClient.ts`: Exports the configured Supabase client used across the app.
  - **Dashboard/**: Main hub shown after successful login.
    - `Dashboard.tsx`: Displays navigation links to the other sections (Editing, Editions, ProgramCourse, ReportSummary, BooksEncoding) and may show user info.
    - `Dashboard.css`: Styling for dashboard panels, cards, and responsive grid.
  - **Editing/**: Interfaces for modifying existing records.
    - `Editing.tsx`: Form-driven component allowing users to edit entries stored in the backend (e.g. course data, report items). Includes form validation and submit handlers.
    - `Editing.css`: Styles for the form layout and error messages.
  - **Editions/**: Lists or manages different editions (e.g. academic years, publication versions).
    - `Editions.tsx`: Presents a table or list of editions, with controls for filtering/searching and, optionally, creating new entries.
    - `Edition.css`: Styling used by `Editions.tsx` to style list rows, headers, and pagination.
  - **ProgramCourse/**: Handles the program/course information display and print templates.
    - `ProgramCourse.tsx`: Renders course/program details; used both for on‑screen viewing and as a basis for printable output.
    - `ProgramCourse.css`: Styles specific to card layouts and print‑friendly formatting.
    - `coursePrintTemplate.ts`: Utility that generates an HTML template or styled content suitable for printing the course information.
  - **ReportSummary/**: Generates summaries for reports.
    - `ReportSummary.tsx`: Collects input criteria, displays generated summary data, and includes print/export options.
    - `ReportSummary.css`: Styles for summary tables, charts, and print views.
    - `reportSummaryPrintTemplate.ts`: Generates a print‑ready template for the report summary.
  - **BooksEncoding/**: Auxiliary component for encoding book or resource data.
    - `BooksEncoding.tsx`: Provides inputs and logic to transform or encode book identifiers, possibly for bulk upload or export.
    - `BooksEncoding.css`: Styles the encoding tool’s UI controls.

These components are assembled by the router inside `App.tsx` and communicate via shared services such as the Supabase client defined in `src/database/client.ts`.
