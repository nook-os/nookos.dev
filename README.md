# nookos.dev

The public marketing site for [NookOS](https://github.com/nook-os/nook-os), an
open source, self-hosted fleet control plane. Served straight from this
repository by GitHub Pages.

> **Before this goes live:** `nook-os/nook-os` is currently a **private**
> repository. This site links to it in six places and calls the project open
> source, so those links 404 for every visitor until the source repo is public.

## What's here

```
index.html          one long landing page
styles.css          the palette, lifted from the product's global.css
main.js             progressive enhancement only (nav, copy buttons, reveal)
assets/screenshots  product screenshots
CNAME               nookos.dev
.nojekyll           serve the tree as-is, no Jekyll pass
VIDEO-SCRIPT.md     four-minute first-person launch video script
```

No build step, no framework, no CDN, no external requests. Everything the page
needs is in this repository, which is the whole reason GitHub Pages can serve it
untouched.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Check it at **360px** and **1440px** before pushing. The page must never scroll
horizontally; wide content (terminal transcripts, the posture table) scrolls
inside its own container.

## Screenshots

Captured at 2560×1440 from a local dev instance seeded with demo data
(nodes `azul`/`crimson`/`slate`, the demo workspaces, board `NOOK`). The markup
declares `width="2560" height="1440"`, so replacements should stay 16:9.

| File | Shot | Status |
|---|---|---|
| `dashboard.png` | Dashboard — nodes, workspaces, sessions, activity feed | real |
| `session-claude.png` | A session with Claude Code live in the terminal | **placeholder** — needs a machine with `claude` installed |
| `workspaces.png` | Workspaces list, showing multi-node checkouts | real |
| `board.png` | Kanban board with cards across all four columns | real |
| `nodes.png` | Nodes page with the live capacity bars | real |
| `new-work.png` | The New Work modal, open | real |
| `settings-tokens.png` | Settings → Access tokens | real |

Two rules when capturing:

1. **Capture from a local instance only.** Never from an instance holding real
   client data.
2. **Scrub before committing.** No real hostnames, tenant names, repository
   names, email addresses or tokens may appear in an image. Demo workspaces are
   `acme/checkout-api`, `globex/billing-worker` and `widgets/web-dashboard`.

If you swap the image dimensions, update the `width`/`height` attributes on the
corresponding `<img>` in `index.html` to match.

## Editing

Alt text is not optional — every `<img>` needs a sentence that describes what is
in the picture, not what the file is called. Headings must stay in order
(`h1` → `h2` → `h3`); they are the document outline a screen reader navigates by.

Colour values live in the `:root` block of `styles.css` and mirror
`frontend/packages/ui/src/global.css` in the product repo. Change them there
first, then here, so the site and the app keep looking like one thing.

## Licence

The NookOS project is Apache-2.0. This site's copy and assets are part of the
same project.
