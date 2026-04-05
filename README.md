# FOSSEE Workshop Booking — UI/UX Enhancement

> **FOSSEE Fellowship Screening Task** · Python · UI/UX Enhancement  
> Redesign of [`FOSSEE/workshop_booking`](https://github.com/FOSSEE/workshop_booking) with a focus on performance, modern UI, responsiveness, accessibility, and SEO.

---

## Live Demo / Screenshots

### Before

| Page | Before |
|------|--------|
| Workshop Types | Plain table, no search, no card layout |
| Login | Minimal card with no validation feedback |
| Statistics | Side-by-side layout breaks on mobile |
| Workshop Status | Raw tables for accepted/proposed workshops |

### After

| Page | Improvement |
|------|-------------|
| Workshop Types | Responsive card grid with live React-powered search filter |
| Login | Inline React form validation, password visibility toggle |
| Statistics | Collapsible mobile filter sidebar, improved chart colors |
| Workshop Status | React-powered tab interface separating Accepted & Proposed |


---

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip
- A MySQL or SQLite database

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/workshop_booking.git
cd workshop_booking
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure local settings

Copy and edit the local settings file:

```bash
cp local_settings.py.example local_settings.py
# Edit local_settings.py — set your SECRET_KEY and DATABASE settings
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create a superuser (optional, for admin access)

```bash
python manage.py createsuperuser
```

### 7. Collect static files

```bash
python manage.py collectstatic
```

### 8. Run the development server

```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000` in your browser.

---

## Files Changed

| File | Description |
|------|-------------|
| `workshop_app/static/workshop_app/css/base.css` | Complete redesign — CSS custom properties, mobile-first grid, modern card, button, form, badge and table styles |
| `workshop_app/templates/workshop_app/base.html` | Added React 18 CDN, Google Fonts (Plus Jakarta Sans), SEO meta tags, improved accessible navbar with login/register links for unauthenticated users |
| `workshop_app/templates/workshop_app/login.html` | React-powered form with client-side validation, password show/hide toggle, accessible error messages |
| `workshop_app/templates/workshop_app/register.html` | Replaced `form.as_table` with styled individual fields in a two-column grid; React password strength indicator |
| `workshop_app/templates/workshop_app/workshop_type_list.html` | Replaced plain table with React-rendered responsive card grid; live client-side search filter; improved pagination |
| `workshop_app/templates/workshop_app/workshop_type_details.html` | Clean definition-list card layout; back navigation; contextual CTA |
| `workshop_app/templates/workshop_app/propose_workshop.html` | Mobile-friendly single-column form; styled modal for T&C; improved error display |
| `workshop_app/templates/workshop_app/workshop_status_coordinator.html` | React tab interface for Accepted / Proposed workshops; welcome banner for empty state |
| `workshop_app/templates/workshop_app/view_profile.html` | Profile card with gradient header; styled field rows; two-column edit form grid |
| `statistics_app/templates/statistics_app/workshop_public_stats.html` | Responsive two-column layout; collapsible mobile filter sidebar; improved chart bar colors |

---

## Reasoning

### What design principles guided your improvements?

**Visual hierarchy first.** Every page was audited for the most important action a user needs to take and that element was made visually dominant — e.g. the "Submit Proposal" button on the proposal page, or the workshop cards on the list page. Supporting information was styled to be quieter (smaller text, muted colour) so the eye flows naturally.

**Mobile-first, not mobile-afterthought.** Styles were written at the smallest viewport first, then expanded with `@media` queries. Grid layouts (`auto-fill`, `minmax`) let content reflow naturally without explicit breakpoints for every possible screen size.

**Consistency through design tokens.** A single set of CSS custom properties (`--primary`, `--radius`, `--shadow`, etc.) is declared once in `base.css` and reused everywhere. This guarantees visual consistency and makes future theme changes a one-line edit.

**Accessibility (WCAG 2.1 AA target).** Every interactive element has a visible focus ring (3 px outline). Form errors are linked to their inputs via `aria-describedby` and `aria-invalid`. Icon-only buttons carry `aria-label`. Tables have `aria-label` attributes. Colour contrast was checked for all text/background pairings.

**Progressive enhancement.** React components are mounted on top of server-rendered Django output. The login form includes a `<noscript>` fallback. Core content is always visible even without JavaScript.

---

### How did you ensure responsiveness across devices?

1. **CSS Grid with `auto-fill` / `minmax`** — the workshop card grid (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) adapts from one column on a 320 px phone to four or more columns on a wide desktop without a single media query.

2. **`clamp()` for fluid typography** — headings use `font-size: clamp(min, preferred, max)` so text scales smoothly between devices instead of jumping at breakpoints.

3. **Fixed navbar height as a CSS variable** — `--nav-height: 60px` is used in `padding-top` for the main content and in the sidebar's `position: sticky` offset, so adding pixels to the navbar only requires changing one variable.

4. **Collapsible filter sidebar on mobile** — the statistics page hides its filter panel behind a toggle button below 992 px. The button's `aria-expanded` attribute is updated programmatically for screen readers.

5. **Horizontal scroll on tables** — tables are wrapped in `overflow-x: auto` containers so they never cause horizontal page overflow on narrow screens.

6. **`em`-based spacing** — padding and margins use `em` / `rem` units that scale with the browser's base font size, respecting user accessibility preferences.

---

### What trade-offs did you make between design and performance?

| Decision | Trade-off |
|----------|-----------|
| React via CDN (unpkg) | Adds ~130 KB (production, gzipped ~42 KB) to the first load. Accepted because it enables reactive components (live search, tabs, form validation) without a build pipeline, keeping the Django workflow intact. The `production.min.js` variant is used to minimise size. |
| Google Fonts (Plus Jakarta Sans) | ~20 KB extra network request. Mitigated with `<link rel="preconnect">` and `display=swap`. The typeface significantly improves readability vs. system-fallback stacks. |
| CSS custom properties only (no Sass/PostCSS) | No build step needed. Minor downside: no `var()` in some very old browsers (IE 11), but FOSSEE's student audience uses modern browsers. |
| Inline `<script type="application/json">` for Django→React data | Avoids an extra AJAX call on page load. The data is already available from the Django view context, so serialising it into a `<script>` tag is the zero-latency option. |
| No lazy loading of React components | For the current page count and component complexity, code-splitting would add more build complexity than it saves. All React code per page is under 5 KB minified. |

---

### What was the most challenging part of the task and how did you approach it?

**Bridging Django's server-rendered template system with React's client-side reactivity — without a build step.**

Django templates render on the server; React lives in the browser. The usual approach (Create React App or Vite) requires a separate build pipeline that would fundamentally change how the project is deployed. That was out of scope.

My solution was a **data-island pattern**:
1. Django renders a `<script type="application/json">` tag containing serialised context data (e.g. the list of workshops).
2. A small inline React script reads that JSON, builds the UI, and mounts it on a designated `<div>`.
3. The Django template retains server-rendered fallbacks (pagination links, `<noscript>` forms) so the page is never blank without JavaScript.

This gave full React interactivity (live search, tabs, form validation) with zero build tooling and no changes to any Django view or URL.

A secondary challenge was ensuring the CSS redesign didn't break the existing Bootstrap classes that views and Django form widgets already emit. The solution was to **extend, not replace** Bootstrap — `base.css` overrides specific Bootstrap selectors (`.card`, `.btn`, `.table`, `.badge`) with the new design tokens, so Django form widgets (which emit Bootstrap class names by default) automatically pick up the new styles.

---

## Submission Checklist

- [x] Code is readable and well-structured
- [x] Git history shows progressive work
- [x] README includes reasoning answers and setup instructions
- [x] Screenshots section included (populate with actual screenshots before submission)
- [x] Code is documented with inline comments where necessary
  