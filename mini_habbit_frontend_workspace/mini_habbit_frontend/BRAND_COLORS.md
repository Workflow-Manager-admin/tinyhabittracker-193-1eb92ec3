# TinyHabitTracker Brand Color Palette

This app uses a defined set of brand colors across UI elements. **Update [tailwind.config.js](./tailwind.config.js) when changing colors or roles.**

| Name         | Hex      | Use Case                                |
| ------------ | -------- | --------------------------------------- |
| `primary`    | #2563eb  | Main brand, call-to-action, key UI      |
| `secondary`  | #64748b  | Secondary UI, links, subtext            |
| `accent`     | #22d3ee  | Success/checked, focus, positive action |
| `danger`     | #dc2626  | Errors, delete buttons, destructive     |
| `warning`    | #eab308  | Warnings, alerts                        |
| `success`    | #16a34a  | Confirmations, success, badges          |
| `info`       | #3b82f6  | Info, guide, onboarding highlights      |
| `background` | #f8fafc  | Main app/page background, containers    |
| `surface`    | #ffffff  | Card, surface, overlays (light mode)    |
| `muted`      | #e5e7eb  | Muted, dividers, subtle backgrounds     |
| `dark-bg`    | #0a0a0a  | App bg (dark mode)                      |
| `dark-surface`| #171717 | Card/surface (dark mode)                |
| `dark-muted` | #27272a  | Muted (dark mode)                       |

## Usage Guidelines

- **primary**: Main buttons (`bg-primary`), links, brand highlights.
- **secondary**: Subdued content, secondary nav items, alternate CTAs.
- **accent**: Habit checkmarks, success highlights, progress bars.
- **danger**: Delete, errors, important warnings.
- **warning**: Alert banners, pending actions.
- **success/info**: Confirmations (`bg-success`), info badges, notices.
- **background/surface**: Light backgrounds, cards, modals, backgrounds.
- **muted**: Borders, backgrounds for muted UI, disabled inputs/content.
- **dark palette**: Used automatically by Tailwind's dark mode classes.

Edit the color values or roles only after consulting lead UI/UX/designer.

See also: `tailwind.config.js` for actual Tailwind color configuration.
