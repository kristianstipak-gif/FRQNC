# FRQNC — Frequency Explorer
Mobile-first public SDR directory and frequency research PWA.

## MVP
- Frequency entry in Hz, kHz, MHz and GHz with broad band classification.
- Saved frequencies in browser local storage.
- Best-effort public KiwiSDR directory fetch.
- Links to public receiver catalogs.
- Mobile-first interface and PWA manifest.

## Limitations
- Direct directory loading may fail due to CORS, endpoint changes or source policies.
- A frequency entry is not proof of an active transmission.
- This MVP does not tune remote receivers or stream live RF.
- Coverage depends on receiver hardware and operator permissions.
- It does not decode encrypted/private communications.

## Development
`npm install`
`npm run dev`
`npm run build`

## Roadmap
Add a server-side receiver catalog sync, source-specific adapters, receiver health checks, and a dedicated database after the isolated FRQNC Supabase project is restored and verified.