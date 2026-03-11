# Component Documentation

This document collects detailed descriptions of the UI components used in the React application (`my-app`). It complements the high-level overview in the main `README.md`.

## Table of Contents

- [Structure Overview](#structure-overview)
- [Login](#login)
- [Dashboard](#dashboard)
- [ProgramCourse](#programcourse)
- [Editing](#editing)
- [Editions](#editions)
- [ReportSummary](#reportsummary)
- [BooksEncoding](#booksencoding)


## Structure Overview

All components live under `src/components` and are grouped by feature. Each folder typically contains:

- A `.tsx` file defining the React component(s) and associated logic.
- A `.css` stylesheet with component-specific styles.
- Additional helpers or templates where applicable.

The root `App.tsx` handles routing between pages and renders the appropriate component based on the current path.

Shared services such as the Supabase client are initialized in `src/database/client.ts` and imported where needed.

---

## Login

- **Location**: `src/components/Login/`
- **Files**:
  - `LoginPage.tsx`: Entry point for authentication. Displays a branded login card with email/password fields, validates input, and interacts with Supabase.
  - `Login.css`: Styles for the background overlay, form card, inputs, and error states.
  - `supabaseClient.ts`: Exports the configured Supabase client used throughout the application.

### State & validation

* `email` / `password` – controlled input values.
* `emailError` – stores validation error message shown below the email field.

Validation rules:
- The email must end with `@mymail.mapua.edu.ph`; otherwise the message "Invalid Email" is shown.
- Validation is performed on blur and again on submit; submission is prevented if the email is invalid.

Helper functions in the file:

```ts
const validateEmail = (value: string) => {
  if (!value.endsWith("@mymail.mapua.edu.ph")) return "Invalid Email";
  return "";
};
```

### Submission flow

1. On form submission, `handleSubmit` prevents default and runs `validateEmail`.
2. If validation passes, it calls:
   ```ts
   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   ```
3. Errors from Supabase trigger a console log and an `alert` with the message.
4. On successful login, a console message and alert are shown; `App.tsx` will detect the session and render `<Dashboard />`.

> Note: Redirect to `/dashboard` doesn’t happen explicitly here; session state is handled globally in `App.tsx`.

### User interface

The JSX markup includes:

```tsx
<div className="login-bg">
  <div className="login-overlay" />
  <div className="login-wrap">
    <div className="login-card2">
      <img src="/images/logo.png" alt="Login Logo" className="login-logo2" />
      <form onSubmit={handleSubmit} className="login-form2">…</form>
    </div>
  </div>
</div>
```

*Email field* shows `field-error` div when `emailError` is non‑empty.
*Password field* has no special validation aside from the `required` attribute.
*Login button* has class `login-btn2` and submits the form.

### Accessibility & UX

* The email input triggers validation on blur to give immediate feedback.
* `required` attributes ensure that empty fields can't be submitted.
* Alerts are used for success/failure messages; these could be replaced with inline notifications later.

### Notes

* The component is simple and stateless besides input management; it does not depend on context or routing.
* Any change to the email pattern should also update the `validateEmail` logic and possibly tests in `usertesting_securitylogin.md`.
* Styling lives in `Login.css` which sets up a full‑screen background with a semi‑transparent overlay and centers the card.

---

## Dashboard

- **Location**: `src/components/Dashboard/`
- **Files**:
  - `Dashboard.tsx`: Shows statistical summaries and quick navigation; includes search and logout functionality.
  - `Dashboard.css`: Styles for page layout, cards, charts, and dropdowns (classes prefixed `dash-`).

### Data model

```ts
interface BookRow {
  id: number;
  Title: string | null;
  Author: string | null;
  Department: string | null;
  Program: string | null;
  Course_code: string | null;
  Created_at: string | null;
}
```

### Icons

The file defines several inline SVG icon components used throughout the UI:
* `IconBooks`, `IconCalendar`, `IconBuilding`, `IconGraduationCap`, `IconTag` — used in stat cards.
* `IconSearch` — displayed inside search input.
* `IconFolder`, `IconLayers`, `IconBarChart` — shown in quick‑access buttons.

### State and hooks

* `books` – list of `BookRow` loaded from `v_course_books` view in Supabase.
* `loading` – loading flag for data fetch.
* `searchTerm`, `searchResults`, `showSearchDropdown` – manage live filtering of `books` for search.
* `useEffect` (on mount) loads books, orders by `created_at` descending.
* `useEffect` (on searchTerm/books change) filters results and toggles dropdown.
* Logout handler calls `supabase.auth.signOut()`.

### Computed values

* `booksThisMonth`, `booksLastMonth` – lists filtered by creation date.
* `totalBooks`, `uniqueDepts`, `uniquePrograms`, `uniqueCourses` – summary counts.
* `monthlyChange` & label – difference between this month and last.
* `recentBooks` – first five entries, used to populate recent list.
* `last6Months` – array of `{label,count}` for last half‑year, used to render bar chart; `maxCount` used to normalize bar heights.

### UI layout

- **Header**: logo and search input with dropdown results.
- **Actions**: "+ Log New Book/s" button navigates to `/books-encoding` with state to open modal.
- **Stats cards**: display totals, department/program/course counts, this month count with change indicator.
- **Bottom section**:
  * Bar chart of last six months.
  * Recently logged books list with date and metadata; button to view full report.
- **Quick Access** buttons navigate to other pages with descriptive icons and text.

### Search behaviour

Typing in the search field filters `books` by title, author, or course code (case‑insensitive).
Results shown in a dropdown; clicking an item populates the search box.

### Navigation

Uses `react-router`'s `NavLink` for sidebar links; active link gets `active` CSS class.
Clicking log button passes `location.pathname` to allow returning after modal close.

### Additional notes

* Dashboard is the default landing page after login.
* It relies on the `v_course_books` view; any backend changes may require adjusting field names.
* CSS classes are heavily prefixed (`dash-`) to avoid collisions.
* The component maintains all its own state and does not depend on context providers.

---

## Editing

- **Location**: `src/components/Editing/`
- **Files**:
  - `Editing.tsx`: Provides a modal form for updating book records and optionally their course linkage.
  - `Editing.css`: Styles for the editing modal (uses `be-` classes) and the surrounding page frame (`pc-` prefixes).

### Data model

```ts
interface BookRow {
  id: number;
  Title: string | null;
  Author: string | null;
  Department: string | null;
  Program: string | null;
  Course_code: string | null;
  Created_at: string | null;
}
```

### Icons

The file defines several inline SVG icon components used throughout the UI:
* `IconBooks`, `IconCalendar`, `IconBuilding`, `IconGraduationCap`, `IconTag` — used in stat cards.
* `IconSearch` — displayed inside search input.
* `IconFolder`, `IconLayers`, `IconBarChart` — shown in quick‑access buttons.

### State and hooks

* `books` – list of `BookRow` loaded from `v_course_books` view in Supabase.
* `loading` – loading flag for data fetch.
* `searchTerm`, `searchResults`, `showSearchDropdown` – manage live filtering of `books` for search.
* `useEffect` (on mount) loads books, orders by `created_at` descending.
* `useEffect` (on searchTerm/books change) filters results and toggles dropdown.
* Logout handler calls `supabase.auth.signOut()`.

### Computed values

* `booksThisMonth`, `booksLastMonth` – lists filtered by creation date.
* `totalBooks`, `uniqueDepts`, `uniquePrograms`, `uniqueCourses` – summary counts.
* `monthlyChange` & label – difference between this month and last.
* `recentBooks` – first five entries, used to populate recent list.
* `last6Months` – array of `{label,count}` for last half‑year, used to render bar chart; `maxCount` used to normalize bar heights.

### UI layout

- **Header**: logo and search input with dropdown results.
- **Actions**: "+ Log New Book/s" button navigates to `/books-encoding` with state to open modal.
- **Stats cards**: display totals, department/program/course counts, this month count with change indicator.
- **Bottom section**:
  * Bar chart of last six months.
  * Recently logged books list with date and metadata; button to view full report.
- **Quick Access** buttons navigate to other pages with descriptive icons and text.

### Search behaviour

Typing in the search field filters `books` by title, author, or course code (case‑insensitive).
Results shown in a dropdown; clicking an item populates the search box.

### Navigation

Uses `react-router`'s `NavLink` for sidebar links; active link gets `active` CSS class.
Clicking log button passes `location.pathname` to allow returning after modal close.

### Additional notes

* Dashboard is the default landing page after login.
* It relies on the `v_course_books` view; any backend changes may require adjusting field names.
* CSS classes are heavily prefixed (`dash-`) to avoid collisions.
* The component maintains all its own state and does not depend on context providers.

---

## Editions

- **Location**: `src/components/Editions/`
- **Files**:
  - `Editions.tsx`: Allows filtering books by department/program/course code and shows their edition status.
  - `Edition.css`: Styling for filters, tables, messages, and layout (`pc-` prefixed classes).

### Data model

```ts
interface ViewRow {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  title: string | null;
  author: string | null;
  copyright_year: number | null;
}
```

### Constants

* `OUTDATED_YEARS` – threshold (5 years) used to label a book as “OUTDATED”.

### State and filters

* `departments`, `programs`, `courseCodes` – lists populated from `library_courses` table.
* `selectedDepartment`, `selectedProgram`, `selectedCourseCode` – current filter values.
* `searchTerm` – free‑text search applied to the loaded books.
* `books` – loaded book rows matching the selected filters.
* `loading` – boolean flag for asynchronous operations.

### Computed values

* `getStatus(year)` – returns “OUTDATED” or “LATEST EDITION” based on `OUTDATED_YEARS` constant.
* `filteredBooks` – memoised list of `books` filtered by search term (title or author).
* UI flags such as `showCourseHint`, `showNoCodes`, `showTableHint` control messaging when selections are incomplete or loading.

### Data loading effects

* On mount, load unique departments.
* When `selectedDepartment` changes, load programs for that department.
* When both department and program are chosen, load course codes.
* When department/program/code all set, load corresponding books from `v_course_books` view.

Each loader updates the `loading` flag and handles errors by logging and resetting the relevant state.

### UI layout

* Sidebar navigation identical to other pages, plus logout button.
* Header includes search input and “Log Books” button (navigates to book encoding modal).
* Left panel (`pc-leftCard`) contains dropdowns for department/program and a selectable list of course codes.
  * Displays hints/empty messages while selections are incomplete or no codes exist.
* Right panel (`pc-rightCard`) shows a table of books:
  * Columns: ID, Title, Author, Year, Status, Edit action.
  * Shows helpful rows/messages when filters are incomplete, loading, or no books found.
  * Each book can be edited via `navigate('/editing/:id', { state: { from } })`.
* Footer note explains the outdated rule.

### Interactions

* Selecting department resets downstream filters (program, course code, books).
* Clicking a course code sets `selectedCourseCode` and triggers book loading.
* Search field filters results on the client.
* “Edit” buttons open the editing modal with return path preserved.

### Notes

* The view depends on the `v_course_books` database view; changes there will affect fields available.
* Styling uses persistent page layout classes (`pc-`) shared with other pages.
* The search functionality is simple and runs in‑memory on whatever books were fetched.

---

## ProgramCourse

- **Location**: `src/components/ProgramCourse/`
- **Files**:
  - `ProgramCourse.tsx`: Browse the library by department, program, and course code; search, print, and log new books.
  - `ProgramCourse.css`: Styles for filters, grid layout, buttons, and print preview.
  - `coursePrintTemplate.ts`: Utility that builds an HTML string suitable for printing the currently filtered course library.

### Data model

```ts
export type ViewRow = {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  acc_no: string | null;
  call_no: string | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
  apa_citation: string | null;
};
```

### Helper utilities

* `uniqSorted(values)` – returns a sorted array of unique non‑empty strings.
* `SelectField` – reusable component rendering a labeled select input with caret icon.

### State & derived values

* `departments`, `programs`, `courseCodes` – dropdown options loaded from `library_courses`.
* `selectedDepartment`, `selectedProgram`, `selectedCourseCode` – current filter selections.
* `searchTerm` – text used to filter displayed books.
* `books` – array of `ViewRow` fetched for the current course code.
* `courseTitle` – derived memo value from `books[0].course_title`.
* `filteredBooks` – memoised results after applying `searchTerm` across multiple book fields.
* `loading` – flag for async operations.

Reset helpers clear downstream state when a higher‑level filter changes.

### Data loading with cancellation

Each load function (`loadDepartments`, `loadPrograms`, `loadCourseCodes`, `loadBooks`) accepts a
`cancelledRef` object. Effects create this ref and set `cancelledRef.cancelled = true` on cleanup,
avoiding state updates after unmount or rapid user input. All loads set the `loading` flag and
handle errors by logging and resetting respective state.

Effects:
1. On mount → load departments.
2. When `selectedDepartment` changes → reset program/code/books, then load programs.
3. When `selectedProgram` changes → reset course/books, then load course codes.
4. When `selectedCourseCode` changes → reset books, then load books for that selection.

### Printing

`printCourseLibrary()` constructs a header string and calls `buildCoursePrintHtml(header, filteredBooks)`,
then opens a new browser window and writes the returned HTML. The Print button is disabled unless a
course code is selected.

### UI layout & interactions

* Page includes sidebar navigation and logout, consistent with other pages.
* Header has search input, Print and Log Books buttons; Log navigates to the book encoding modal.
* Left panel uses `SelectField` components for department/program and a custom box listing course codes.
  * Shows hints/messages for missing selections, loading state, or no codes.
* Right panel displays the books table with columns: ID, Title, Author, Publisher, Acc/Call No, Year, and
  print‑style icon (for each row?). Actually table columns appear in code earlier; there is also search filter.
* Search filters `filteredBooks` only; no server call.
* Print uses the currently filtered list.

### Notes & considerations

* Maintains pattern similar to `Editions` but includes print capability and course title display.
* Cancellation logic avoids race conditions when rapidly switching filters.
* `coursePrintTemplate.ts` defines the structure for printed output; modifications there may require
  updates to `printCourseLibrary` in this file.
* The component is self‑contained; aside from the Supabase view references, it does not rely on
  global context.

---

## ReportSummary

- **Location**: `src/components/ReportSummary/`
- **Files**:
  - `ReportSummary.tsx`: Generates a per-course summary report with counts by copyright year and flags for ARC/needed titles.
  - `ReportSummary.css`: Styling for filters, summary table, and layout (`rs-` prefixes).
  - `reportSummaryPrintTemplate.ts`: Builds printable HTML for the computed summary (`buildReportSummaryPrintHtml`).

### Data models

```ts
interface ViewRow {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  copyright_year: number | null;
  num_vols: number | null;
}

interface SummaryRow {
  course_code: string;
  course_title: string;

  total_titles: number;
  total_vols: number;

  arc: number;
  perYear: Record<number, number>;

  withinLast5: number;
  neededTitles: number;
}
```

### Constants

* `REQUIRED_RECENT_TITLES = 5` – used to compute how many titles are needed within the last five years.

### State & computed values

* `departments`, `programs` – loaded for filter dropdowns.
* `selectedDepartment`, `selectedProgram` – current filter selections.
* `searchTerm` – filters the summary by course code/title.
* `rows` – raw `ViewRow` data fetched from `v_course_books`.
* `yearCols` – array of the current year and previous five years, used for table columns.
* `summary` – memoised aggregation of `rows` into `SummaryRow` objects, applying "distinct by title" logic to avoid duplicates, counting ARC entries, per‑year counts, within‑last‑5, and needed titles; finally filtered by `searchTerm`.
* `loading` – flag for asynchronous operations.

Helper utility `uniqSorted` (same as other components) is reused.

### Data loading with cancellation

* `loadDepartments`, `loadPrograms`, `loadSummaryRows` each accept a `cancelledRef` to avoid setting state after unmount.
* Effects trigger these loaders:
  1. On mount → departments.
  2. On `selectedDepartment` change → reset programs/rows and load programs.
  3. On `selectedProgram` change → reset rows and load summary rows.

### Summary aggregation logic

* Titles are distinct by `${course_code}|${book_id}`; volumes summed similarly.
* ARC count increments when `copyright_year < currentYear - 5`.
* Per-year counts are stored in `perYear` keyed by year.
* After iterating, compute `withinLast5` and `neededTitles` for each course.
* Filter the resulting list by `searchTerm` if provided.

### Printing

`printReport` uses `buildReportSummaryPrintHtml` with `department`, `program`, `yearCols`, and the `summary` array to generate HTML, then opens a new window and writes it.
Button disabled unless department and program selected and summary non‑empty.

### UI layout & interactions

* Sidebar/nav same as other pages.
* Header includes search input and Log Books button.
* Main box contains department/program selects and a Print button.
* The summary table has columns for course code, title, totals, ARC, yearly counts, within‑5, and needed titles.
* Empty/loading/no-data messages handle various states.
* Search filters summary rows client‑side.

### Notes

* The component shares cancellation patterns with ProgramCourse.
* All calculations happen on the client; large data sets may affect performance.
* Modifying year logic or thresholds will require updating the aggregation code and tests.
* Printed output is governed by the template module; changes there should be coordinated.

---

## BooksEncoding

- **Location**: `src/components/BooksEncoding/`
- **Files**:
  - `BooksEncoding.tsx`: Primary page for logging books manually or via bulk import. Contains the `BookEncodingModal` subcomponent.
  - `BooksEncoding.css`: Styles for the page layout (`pc-` prefix) and modal (`be-` prefix).

### Data models

```ts
// course row returned from supabase
interface CourseRow {
  id: number;
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;
}

// payload inserted into library_books
interface BookInsert {
  source_key: string;
  acc_no: string | null;
  call_no: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
  isbn: string | null;
  supplier: string | null;
  year_purchase: number | null;
  apa_citation: string | null;
}

// form state for controlled inputs
interface FormState {
  title: string;
  author: string;
  department: string;
  program: string;
  course_code: string;
  publisher: string;
  year: string;
  year_purchase: string;
  num_vols: string;
  acc_no: string;
  call_no: string;
  isbn: string;
  supplier: string;
  apa_citation: string;
}
```

### Key helper functions

* `trimOrNull` – trim a string and return `null` if empty
* `toIntOrNull` – parse integer or return `null`
* `coalesceGeneral` – return trimmed value or "General"
* `makeSourceKey` – generate unique source identifier
* `getOrCreateCourseId` – lookup or insert a course row
* `insertBookAndLink` – add book row and link to course via junction table

### Modal & Import

* `BookEncodingModal` handles the form, file import, and validation.
* `REQUIRED_HEADERS` constant defines necessary Excel column names.
* Excel import uses [`xlsx`](https://www.npmjs.com/package/xlsx) to read the first sheet, validate headers, and iterate rows.
* Rows with missing title are skipped; each imported book is inserted/linked exactly as manual entries.

### Page behavior

* Clicking **Log New Book/s** opens modal.
* State stored in `location.state` allows opening modal directly on navigation.
* `handleAdd` processes manual submissions.
* Keyboard `Escape` closes modal.

---

> **Note:** Additional components might be added over time; update this document accordingly.
