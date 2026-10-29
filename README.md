# Sufi Palace website

The complete Sufi Palace restaurant landing page, ready to push to GitHub and import into Vercel. It uses HTML, CSS, browser JavaScript and a locally bundled Three.js menu book. There is no application backend, database, API key or runtime dependency to configure.

## Preview locally

Install Node.js 22 or newer, then open a terminal in this project folder:

```sh
npm ci
npm run dev
```

Open <http://localhost:4178>. Use an HTTP server rather than opening `index.html` directly; the menu book uses JavaScript modules.

To select another port:

```sh
npm run dev -- --port 4180
```

## Check before deployment

```sh
npm run build
```

This validates JavaScript syntax, local image/style/module paths and section links, then runs the menu leaf regression tests. The website files are already in `public/`; no compilation or framework build is needed.

## Push to your GitHub repository

The working folder already has local Git history. A ZIP extract starts without Git history; `git init` below supports both cases. Create an empty repository on GitHub, without an initial README, then run the following from this folder. Replace `YOUR_REPOSITORY_URL` with the HTTPS or SSH URL shown by GitHub.

```sh
git init
git add .
git commit -m "Organize Sufi Palace for Vercel"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

If you already configured an `origin`, inspect it with `git remote -v` and use that repository instead of adding another remote. This setup does not change your existing GitHub remotes.

## Import into Vercel

1. In Vercel, choose **Add New → Project** and import your GitHub repository.
2. Use the **repository root** as the Root Directory, not `public/`.
3. The committed `vercel.json` provides these settings:

| Setting               | Value                                |
| --------------------- | ------------------------------------ |
| Framework preset      | Other                                |
| Build command         | `npm run build`                      |
| Output directory      | `public`                             |
| Install command       | Default (`npm ci` with the lockfile) |
| Environment variables | None required                        |

4. Deploy. Subsequent pushes to the connected production branch are handled by Vercel's Git integration.

See [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json) and [Git deployment documentation](https://vercel.com/docs/git).

## Folder layout

```text
sufi-palace/
├── public/                    # Everything the web server serves
│   ├── index.html             # Landing page, navigation and WhatsApp form
│   ├── css/site.css           # Desktop/mobile layouts and animations
│   ├── js/
│   │   ├── app.js             # Entrance, galleries, cursor, tooltips, WhatsApp
│   │   ├── menu-book.js       # Interactive Three.js menu book
│   │   └── book-leaf.js       # Opaque page volume, curl and turn planning
│   ├── assets/
│   │   ├── backgrounds/       # Desktop and dedicated mobile artwork
│   │   ├── branding/          # Restaurant wordmark and WhatsApp emblem
│   │   ├── food/              # Illustrative food artwork
│   │   ├── logos/             # Platform logos
│   │   └── photos/            # Restaurant photographs
│   └── vendor/                # Bundled Three.js modules and its license
├── scripts/                   # Dependency-free preview and build checks
├── tests/                     # Menu geometry and page-order regression tests
├── docs/                      # Asset notes, sources and design references
├── .openai/hosting.json        # Existing Sites binding; ignored by Vercel
├── .gitignore
├── .vercelignore
├── .editorconfig
├── package.json
├── package-lock.json
└── vercel.json
```

## Common edits

- **Copy, address and links:** `public/index.html`.
- **Colours, typography and responsive artwork:** `public/css/site.css`. CSS image URLs are relative to the `css/` folder.
- **Hover summaries and platform rating snapshots:** `public/js/app.js`. Counts are static snapshots, not a live feed.
- **WhatsApp number:** update `918450077775` in `public/js/app.js`, and the displayed number in `public/index.html`.
- **Menu pages and book behaviour:** `public/js/menu-book.js`.
- **Image sources and credits:** `docs/assets/README.md`.

WhatsApp opens a prepared message for the visitor to review and send. It does not send automatically or confirm reservations. Google Fonts, YouTube embeds and platform links need an internet connection. Embedded video availability remains controlled by its uploader.

## Palace entrance

The homepage entrance uses dedicated desktop and mobile Mughal door illustrations and a transparent mist texture. The generated artwork is vector-style raster artwork, delivered as JPEG/PNG assets. The doors hinge open as the hero gently zooms into place; mist disperses over the reveal.

The normal sequence takes about 3.2 seconds after the door image is decoded. **Skip intro** or **Escape** ends it immediately. Reduced-motion visitors and direct section links bypass the entrance. Failed artwork/script loading has a bounded fallback so the page stays accessible.

- Artwork and motion: `public/css/site.css` (Palace entrance section).
- Timing and dismissal: the opening block in `public/js/app.js`.
- Artwork prompts: `docs/assets/entrance-generation.md`.

## Cinematic menu and scroll guide

Menu pages use opaque front and reverse surfaces with physical separation, a stitched paper edge, independent reverse UVs and decorative palace artwork on the back. The moving sheet does not receive its own shadows. Its rest curve matches the stationary pages.

The menu supports horizontal swipe, the previous/next buttons and left/right keys when the book is focused. Vertical touch movement stays available for normal page scrolling. Reduced-motion visitors get immediate page changes.

Small Three.js lanterns illuminate the plinth; a gentle scroll camera movement runs only near the menu. WebGL texture work starts as the menu approaches the viewport. A lost WebGL context returns to the readable HTML fallback.

The desktop chapter rail links to each main section and follows the current section. A thin reading-progress line remains available on smaller screens; the hero's “Begin the story” link leads into the story section. Scrolling stays native.

Run `npm test` for face separation, reverse UV orientation, page order and all-angle paper-volume checks. These tests are also part of `npm run build`.
