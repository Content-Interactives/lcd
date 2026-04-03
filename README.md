# Least Common Denominator (LCD) Interactive

React (JSX) SPA for least common denominator / equivalent fractions work. Curriculum, placement, and standards: [Standards.md](Standards.md).

**Live site:** [https://content-interactives.github.io/lcd/](https://content-interactives.github.io/lcd/)

---

## Stack

| Layer | Notes |
|--------|--------|
| Build | Vite 6, `@vitejs/plugin-react` |
| UI | React 19 |
| Styling | Tailwind CSS 3 |
| Icons | `lucide-react` |
| Deploy | `gh-pages -d dist` (`predeploy` → `vite build`) |

---

## Layout

```
vite.config.js          # base: '/lcd/'
src/
  main.jsx → App.jsx → components/LCD.jsx
  components/ui/...    # includes slider, card, input, etc.
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview `dist/` |
| `npm run lint` | ESLint |
| `npm run deploy` | Build + publish to GitHub Pages |

---

## Configuration

`base` in `vite.config.js` must match the GitHub Pages project path (`/lcd/`).
