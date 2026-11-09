# Household Ready

A practical UK household emergency planner. Independent of government and emergency services. Early version, not a live alert service.

## First release

- Household size, planning duration, optional child and pet supplies.
- Supply quantities with transparent drinking-water coverage: 3 L/person/day; extra needs excluded.
- Emergency contacts, meeting arrangements, radio frequencies and support notes.
- Local browser persistence; JSON export and validated restore; print layouts.
- Service worker caches application shell after a successful online visit. Guidance is explicitly downloaded into local storage.
- Versioned snapshots of three allowlisted official pages, with source checks, source publication timestamps where available, snapshot timestamps and separate device download timestamps.
- Daily archive workflow prepared for GitHub Actions. Changes to tracked guidance preserve earlier versions.

## Development

No runtime packages or API keys required. Node 22+ and Python 3.

```sh
npm test
npm run build
npm run dev
```

`npm run updates` captures current official guidance. `dist/` is deployable static output. Vercel settings are in `vercel.json`.

## Archive behaviour and limits

The allowlist is in `scripts/archive_updates.py`. It monitors known guidance pages and one campaign announcement; it does not discover every new government announcement. Hashes identify changed text. Original snapshots remain in `public/data/updates.json`. Failures retain earlier text and the last successful source timestamp. Content is rendered as escaped plain text, never publisher HTML.

The app's update button downloads the deployment's latest archive. It does not directly check publishers. After GitHub Actions commits an archive, a connected Vercel project must deploy that commit for users to receive it. GitHub bot commits may not trigger all third-party Git integrations: verify this before claiming unattended delivery. Scheduled workflows may be delayed; private repositories may have usage limits. No scheduled updater is active until the repository and workflow are connected.

## Privacy and offline limits

No tracking, authentication, remote personal-data storage or external fonts. Plans and downloaded guidance live in this browser. Browser storage can be cleared or evicted; export and print backups. Plain-text backups can contain private notes. Offline first use is impossible: open online and wait for the offline-ready indicator, then explicitly download guidance. Mobile background updates are not guaranteed. Installation support depends on the browser. SVG app icon is included; platform-specific raster icons remain a release task.

## Before wider release

- Connect repository and deployment, verify scheduled archive delivery.
- Add discovery of new official announcements, source selection, per-source change summaries and configurable equipment targets.
- Add browser regression coverage for offline reload, storage failures, print, keyboard and small screens.
- User research with households needing additional support.
- Review guidance coverage, attribution and update operation ownership.

## Attribution

Official advice is attributed to original URLs and captured timestamps. GOV.UK content is under the Open Government Licence v3.0 except where otherwise stated. Application source has no open-source licence assigned yet.
