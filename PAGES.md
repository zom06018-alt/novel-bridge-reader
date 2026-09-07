# GitHub Pages

This repository includes a prebuilt static app in `docs/`.

## Enable publishing

Open repository Settings → Pages:

- Source: Deploy from a branch
- Branch: main
- Folder: /docs
- Save

After GitHub finishes deployment, the expected URL is:
https://zom06018-alt.github.io/novel-bridge-reader/

This URL is not live until Pages is enabled and deployment succeeds.
Private repositories require a GitHub plan that supports private-repository Pages.
Do not change repository visibility unless you intend to publish the source code.
A Pages site may be public even when its source repository is private.

## Features and limits

- Gemini API key and Vertex AI Express key: browser-to-Google requests.
- Vertex service-account JSON: private key stays in browser memory; browser Web Crypto signs an assertion and exchanges it directly with Google's token endpoint. Browser/network/API restrictions may prevent this; use Express mode if token exchange is blocked.
- No credentials are included in the published app, stored in browser storage, or uploaded to this repository. Enter your own key at runtime. Google API usage can incur charges.
- Text translation, chunked translation, original comparison, reading settings, copy and download are supported.
- URL loading works only for HTTPS sites that permit cross-origin browser access. Most novel sites block this. Paste their text instead. There is no third-party proxy.
- The app does not execute fetched HTML. It parses text in an inert document.
- Live Gemini and Vertex calls have not been verified using real credentials.

## Rebuild after source changes

With Node.js 22.13 or later:

```sh
npm ci
npm run build:pages
```

Commit the updated `docs/` output along with source changes. Pages publishes the committed output; it does not run this build automatically.

`pages/main.tsx` loads the shared UI with Pages mode enabled. `vite.pages.config.ts` creates relative asset URLs so the app works under a repository subpath.
The original Sites build and server routes remain available separately; Pages does not run them.
