# Community Algorithm Dashboard

A Next.js dashboard for exploring and tuning the Framer marketplace ranking algorithm. Template data is pulled from BigQuery.

## Prerequisites

- Node.js 18+
- Access to the `framer-data-analysis` GCP project

## Google Cloud authentication

Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) if you haven't already, then log in with application default credentials:

```bash
gcloud auth application-default login
```

This stores credentials locally that the BigQuery client picks up automatically — no env vars needed for local development.

> **Deployed environments** use the `GCP_SERVICE_ACCOUNT_KEY` env var (a JSON service-account key) instead of ADC.

## Local development

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). The `/api/templates` route queries BigQuery and caches results for 5 minutes.

## Other commands

| Command | Description |
| --- | --- |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
