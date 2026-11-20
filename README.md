# FRQNC — Frequency Explorer

Mobile-first public SDR directory and frequency research PWA.

## Current implementation

- Frequency entry in Hz, kHz, MHz and GHz with broad band classification.
- Saved frequencies in browser local storage.
- Public KiwiSDR directory fetched through the FRQNC Cloudflare Worker API.
- Receiver metadata: name, location, antenna, listener count, offline flag and published external-API policy.
- Links to additional public receiver catalogs.
- Mobile-first interface and PWA manifest.

## Deployed API

Worker: `frqnc-api`

- Health: `https://frqnc-api.kristianstipak.workers.dev/api/health`
- Public receivers: `https://frqnc-api.kristianstipak.workers.dev/api/receivers`

Source code: `workers/frqnc-api/src/index.js`

The receiver directory is the AetherSDR public mirror. The API uses an 1800-second cache and validates the published schema before returning receiver data. It does not attempt native connections to receivers.

## Limitations and operator policy

- This project currently browses public receiver listings; it does not yet tune receivers or stream live RF audio/IQ.
- A frequency entry is not proof of an active transmission.
- KiwiSDR external API permissions are published per receiver. A value of `0` means browser-only use; missing policy is unknown, not permission.
- FRQNC currently opens receiver web pages in the browser and does not bypass operator restrictions.
- Coverage depends on receiver hardware, location, uptime and operator permissions.
- It does not decode encrypted/private communications.

## Development

```bash
npm install
npm run dev
npm run build
```

## Cloudflare Worker

```bash
cd workers/frqnc-api
npx wrangler deploy
```

## Roadmap

1. Verify the deployed API from a normal browser and test the live receiver directory.
2. Finish Vercel project creation and production deployment.
3. Add frequency-to-band search and receiver coverage matching.
4. Add a receiver detail view with explicit operator-policy indicators.
5. Only then evaluate a native receive-only SDR streaming adapter for receivers that explicitly permit external API use.
