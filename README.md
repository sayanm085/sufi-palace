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

This validates JavaScript syntax, local image/style/module paths and section links. The website files are already in `public/`; no compilation or framework build is needed.

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

If you already configured an `origin`, inspect it with `git remote -v` and use that repository instead of adding another remote. No GitHub remote has been configured by this preparation.

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
│   │   └── menu-book.js       # Interactive Three.js menu book
│   ├── assets/
│   │   ├── backgrounds/       # Desktop and dedicated mobile artwork
│   │   ├── branding/          # Restaurant wordmark and WhatsApp emblem
│   │   ├── food/              # Illustrative food artwork
│   │   ├── logos/             # Platform logos
│   │   └── photos/            # Restaurant photographs
│   └── vendor/                # Bundled Three.js modules and its license
├── scripts/                   # Dependency-free preview and build checks
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
