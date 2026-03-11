# User Manual

This document guides end users through installation, setup, and day-to-day operations of the application contained in `my-app`.

## 1. Prerequisites

- Node.js (v18 or later recommended)
- npm (bundled with Node.js)
- A Supabase project with URL and anon key for authentication

## 2. Setup & Development

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd App_dev_lab-project/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment file**
   Create a `.env` at the root of `my-app` containing:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

5. **Build for production**
   ```bash
   npm run build
   ```
   and optionally `npm run preview` to serve the built files.

## 3. Logging in

- Upon opening the app, you are presented with a login screen.
- Enter your MAPUA email (`@mymail.mapua.edu.ph`) and password.
- The email field is validated on blur; only addresses with the specified domain are accepted.
- On successful login you will be taken to the **Dashboard**.

> If the credentials are invalid, a browser alert will display an error message.

## 4. Dashboard Overview

The dashboard shows summary statistics of books in the system:

- **Total Books** – cumulative count of all entries.
- **Books This Month** – number added in the current calendar month with comparison to last month.
- **Departments / Programs / Course Codes** – unique counts.
- **Bar chart** – books added over the last six months.
- **Recently Logged Books** – list of most recent entries, with basic metadata.

A search field at the top allows you to look up books by title, author or course code; matching results are
listed in a dropdown, and selecting one fills the search box.

Clicking an item in the recent list will also bring up the edit modal so you can modify its details.

### Navigation

Use the sidebar to move to the following features:
- Program & Course view
- Editions
- Report Summary
- Books Encoding

Click **+ Log New Book/s** to open the book encoding modal from anywhere.

## 5. Program & Course View

This page lets you browse books by department, program, and course code.

1. Select a **Department** → **Program** → click a **Course Code** from the list.
2. The right panel will display books matching the selection; you can search the list locally.
3. Click **Print** to open a print-friendly window for the selected course library.
4. Use the **Log Books** button to open the encoding modal with navigation state preserved.

## 6. Editions

This report allows you to filter and view the edition status of books.

1. Pick a department and program from the dropdowns on the left.
2. A list of course codes appears; select one to load books.
3. The table on the right shows each book’s ID, title, author, year, and a status indicator
   (`LATEST EDITION` or `OUTDATED` if older than 5 years).
4. A search box filters titles/authors in the table.
5. Click **Log Books** to record new entries.

## 7. Report Summary

Generates a consolidated summary by course for a department/program.

1. Choose a department and program.
2. The table displays counts: total titles, volumes, ARC titles, year-by-year counts,
   titles within the last 5 years, and needed titles (based on a 5-title threshold).
3. Use the search box to filter by course code or title.
4. Click **Print** to open a printable summary document.

## 8. Book Encoding

The modal allows manual and bulk entry of book data.

### Manual entry

1. Click **Log New Book/s**.
2. Fill in fields such as Title, Author, Department, etc.
3. Submit to save the book and link it to a course (courses are created if missing).

### Bulk import

1. From the modal, click **Import Excel** and select a `.xlsx`, `.xls`, or `.csv` file.
2. File must contain the following headers exactly:
   ```
   Book Title, Year Purchase, Author, Number of Volumes,
   Department, Acc. Number, Program, Call Number,
   Course Code, ISBN, Publisher, Supplier,
   Year (Copyright), APA Citation
   ```
3. The system validates the headers and iterates rows, skipping those without a title.
4. Upon success you’ll see an alert and the modal will close.

## 9. Editing Existing Records

When viewing books in Program & Course or Editions, click **Edit** next to an entry.

- A wide modal pops up pre-populated with book and course details.
- Modify any field; updating the course code will upsert the associated course and
  adjust the book-to-course link.
- Save changes or press Escape/click outside to cancel.

## 10. Printing & Export

Print buttons use helper templates to render HTML that opens in a new window; use the
browser’s print dialog to export to PDF or paper.

## 11. Logging Out

Click the **↩ Sign Out** button in the sidebar on any page to end your session.

## 12. Troubleshooting

- **Blank lists**: ensure you’ve selected the proper filters; loading indicators appear when
  data is being fetched.
- **Import errors**: check that your Excel file uses the required header names.
- **Authentication issues**: verify your Supabase credentials and network connectivity.

For further information, refer to the developer-oriented `component_documentation.md`
or the user-testing guide `usertesting_securitylogin.md` in `proj-docs/`.

---

This manual is intended for end users of the web application.  For developers, see the
component documentation and code comments.
