# Fomi Step Editor

An image editing workspace for product shoots. Every AI edit is a step you can switch off, tune and reorder. Locked areas are checked after every step. One look can be applied to the whole shoot, and only photos that pass every check are exported.

The demo project is a 12-photo shoot for HALO, a fictional serum brand. The photos are 3D renders made for this project, so there are no licence issues.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. It redirects to `/projects/halo-spring`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Stack

- Next.js 16 (App Router) with React 19 and the React Compiler, JavaScript only
- Tailwind CSS v4 with design tokens in `src/app/globals.css`
- CSS Modules for the parts with real CSS logic: canvas geometry, crop marks, sheets, the strength slider and the tile reveal
- `motion` for layout and presence animations, `lucide-react` for icons
- Mona Sans through `next/font/local`

## How it's organised

```
src/
  app/                      routes, mock API and global styles
    api/                    route handlers (see below)
    projects/[id]/          the workspace page, loading skeleton and error screen
  components/
    editor/                 Edit view: canvas, compare handle, overlays, bubble, palette, filmstrip
    panel/                  steps, locks and checks panels shared by the sidebar and sheets
    shoot/                  Shoot view: tiles, fix card, export panel
    workspace/              top bar, layout shell, shortcuts sheet
    ui/                     Button, Menu, Segmented, Sheet, Toast and other primitives
  hooks/                    URL view state, compare drag, shortcuts, apply job polling
  lib/                      geometry, variant composition, checks, jobs, API client
  state/                    editor reducer (with undo and redo) and shoot reducer
  data/                     project and object outlines
public/media/               step variants for photo 1 and every photo of the shoot
```

The project page is a server component. It loads the project and the outlines and hands them to one client `Workspace`. Editor state lives in a single reducer behind a context. The shoot job has its own reducer because it changes on a different rhythm.

## How the fake AI works

Nothing calls a real model.

- **Step variants.** Photo 1 has a render for every on/off combination of the three visual steps. `lib/variants.js` picks the image for the visible steps and stacks them so strength becomes a crossfade.
- **Dust.** Step 4 is a transparent overlay that shows while the step is off.
- **New steps and tweaks.** Instructions like "lighter" or "warmer" map to CSS filters clipped to the selected region's outline.
- **Outlines.** Polygons in 0–1 coordinates drive hit testing, outlines, chip positions and the fix card zoom.

Dragging the compare handle and the strength slider only write CSS variables, so the workspace doesn't re-render on every pointer move. The value is committed to state when you let go.

## Mock API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/projects/[id]` | The project |
| POST | `/api/projects/[id]/steps` | Create a step from a region and instruction |
| POST | `/api/projects/[id]/steps/[stepId]` | Update a step |
| POST | `/api/projects/[id]/checks` | Run checks for the current locks |
| POST | `/api/projects/[id]/apply` | Start applying the look, returns a job id |
| GET | `/api/jobs/[jobId]` | Status of every photo in the job |
| POST | `/api/projects/[id]/photos/[photoId]/restore` | Restore the label or re-run a step |
| POST | `/api/projects/[id]/export` | Start an export |

Requests have a short random delay so loading states are visible.

**Stateless jobs.** Serverless functions don't share memory, so the job id is base64 JSON holding the project and start time. The job route works out each photo's status from the elapsed time and the apply plan in `project.json`. The same id always gives the same answer, on any instance.

**Error states.** Add `?fail=` to the page URL to make one kind of request fail: `step`, `checks`, `apply`, `fix` or `export`. For example `/projects/halo-spring?fail=step`.

## Screen sizes

- **1536 px and up:** the concept layout. The photo grows with the canvas, and the shoot grid goes to 7 columns at 1920 and 8 at 2400.
- **1024–1535:** a narrower filmstrip and panel. The instruction bubble can overlap the photo edge instead of shrinking the photo.
- **768–1023:** the canvas takes the full width, the filmstrip moves to the bottom and the panel opens as a drawer from the Steps button.
- **Under 768:** review mode. A bottom bar opens Steps, Checks and the Shoot. Steps can be toggled and tuned, and tapping an object opens the bubble above the bar. Brush and lock tools are left for desktop, where deep editing happens.

## Accessibility

- Landmarks for the top bar, filmstrip, canvas and panel, plus a skip link
- The compare handle is a `role="slider"` with arrow keys, Shift for bigger steps, Home and End
- The Objects menu gives keyboard and screen reader users the same selection as clicking the photo
- Step rows have toggle buttons with `aria-pressed`, a native range input for strength and Alt+↑/↓ to reorder
- Check results, shoot progress and fixes are announced through polite live regions
- Sheets use the native `dialog` element, so focus is trapped and returns to the trigger
- Press `?` for the keyboard shortcuts

Colours that carry text were checked against WCAG AA. Muted text is `#6B6B65` instead of the lighter grey in the concept, and amber text uses a darker shade (`#925409`) than amber fills.

## Lighthouse

Mobile run against `npm run start`:

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Edit view | 92 | 100 | 100 | 100 |
| Shoot view | 89 | 100 | 100 | 100 |

CLS is 0 on both. LCP is the main photo, around 3.2–3.6 s on Lighthouse's throttled mobile profile.

## Branches

- `main` is production
- `dev` collects finished features
- Each feature is built on its own branch and merged into `dev` through a pull request
