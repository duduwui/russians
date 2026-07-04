# School Management System

A self-contained bilingual (English / Arabic RTL) school management web app. No server, no build step, no dependencies. Open `index.html` (or `app.html`) in any modern browser.

## Files
```
school-app/
├── index.html          Development entry — loads modular JS/CSS
├── app.html            Single-file bundle (for sharing / preview)
├── README.md
├── css/style.css
└── js/
    ├── icons.js        24 inline-SVG icons
    ├── i18n.js         EN / AR translations + apply()
    ├── db.js           LocalStorage DB, CRUD, transactional sales, FK cleanup
    ├── ui.js           Modal, toast, table, formatters, escape
    ├── app.js          Router, chrome, sidebar
    └── modules/
        ├── _lookup.js  Factory used by Grades/Subjects/Shifts/Classes
        ├── dashboard.js
        ├── students.js
        ├── teachers.js
        ├── courses.js
        ├── subjects.js
        ├── grades.js
        ├── classes.js
        ├── shifts.js
        ├── books.js
        ├── sales.js
        ├── reports.js
        └── settings.js
```

## Code-quality features
- **XSS-safe** — all user input is escaped via `UI.escape` in tables, options, and interpolated attributes
- **Referential integrity** — deleting a Teacher/Subject/Grade/Class/Shift/Course nullifies foreign keys on dependents (soft cascade)
- **Transactional sales** — `DB.createSale()` decrements stock atomically; `DB.deleteSale()` restores it (no silent inventory drift)
- **Input validation** — required fields, numeric clamping, date range checks (start ≤ end), stock caps in Sale form
- **Error handling** — DB failures show a toast; render errors show a friendly empty state instead of a blank page
- **Consistent code style** — every module: `render()`, `bind()`, `openForm(id?)`; standardized `data-f=""` attribute selectors; shared `UI.actionButtons(id)` helper; `UI.renderTable` with typed columns (`type: "money"|"date"|"number"`)
- **DRY** — lookup CRUD is a factory (`createLookupModule`), eliminating ~400 lines of duplication
- **Language-aware formatters** — `Intl.NumberFormat` / `toLocaleDateString` with EN / AR-EG locales
- **Focus management** — first input is auto-focused when a modal opens
- **Accessibility** — visible focus rings, `aria-modal`, `title` attributes on icon buttons
- **Print stylesheet** — `@media print` hides chrome and cleans up tables

## Modules & features
- **Dashboard** — Stats (students, teachers, stock, revenue today/month, low stock), recent sales, top-selling books
- **Students** — CRUD + student-only custom fields (per your recommendation), filters by Course/Grade/Shift
- **Teachers** — CRUD, multi-subject assignment
- **Courses** *(central)* — Multi-subject, multi-teacher, shift, start/end dates, filter by shift
- **Subjects, Grades, Classes, Shifts** — Lookup tables (bilingual name, EN + AR), all built via the shared factory
- **Books** — Inventory with book type (autocomplete + free entry), teacher, price, stock, low-stock threshold, status filter
- **Sales** — Auto-total, stock caps live in form, delete restores stock, filters by date range + teacher
- **Reports** — 7 tabs, printable, CSV export (UTF-8 BOM for Excel)
- **Settings** — Org name, logo upload (with size guard), currency, low-stock default, theme, language, JSON backup / restore, reset

## Testing
The bundle is smoke-tested with JSDOM. Current suite: **48/48 passing** — routes render, forms open, sales decrement/restore stock, XSS is escaped, FK cleanup works, language toggle flips RTL, backup round-trip preserves data.

## Data
Persists in `localStorage` under key `school.db.v1`. Sample data seeds on first run.
