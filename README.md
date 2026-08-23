<div align="center">

# compta-perso-server

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&labelColor=333&style=flat)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js->=20-339933?logo=nodedotjs&logoColor=fff&labelColor=333&style=flat)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-2BB24C?logo=github&logoColor=fff&labelColor=333&style=flat)](./LICENSE)

[![MongoDB](https://img.shields.io/npm/v/mongodb?logo=mongodb&logoColor=fff&label=mongodb&labelColor=333&color=47A248&style=flat)](https://www.npmjs.com/package/mongodb)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?logo=vercel&logoColor=fff&labelColor=333&style=flat)](https://vercel.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Atlas-Cluster-47A248?logo=mongodb&logoColor=fff&labelColor=333&style=flat)](https://www.mongodb.com/atlas)

[![Stars](https://img.shields.io/github/stars/goddivor/compta-perso-server?logo=github&logoColor=fff&label=Stars&labelColor=333&color=E3B341&style=flat)](https://github.com/goddivor/compta-perso-server/stargazers)
[![Forks](https://img.shields.io/github/forks/goddivor/compta-perso-server?logo=github&logoColor=fff&label=Forks&labelColor=333&color=8957E5&style=flat)](https://github.com/goddivor/compta-perso-server/network/members)
[![Watchers](https://img.shields.io/github/watchers/goddivor/compta-perso-server?logo=github&logoColor=fff&label=Watchers&labelColor=333&color=1F6FEB&style=flat)](https://github.com/goddivor/compta-perso-server/watchers)
[![Contributors](https://img.shields.io/github/contributors/goddivor/compta-perso-server?logo=github&logoColor=fff&label=Contributors&labelColor=333&color=DB61A2&style=flat)](https://github.com/goddivor/compta-perso-server/graphs/contributors)
[![Open issues](https://img.shields.io/github/issues/goddivor/compta-perso-server?logo=github&logoColor=fff&label=Issues&labelColor=333&color=3FB950&style=flat)](https://github.com/goddivor/compta-perso-server/issues)

The **sync API** behind Compta Perso: four serverless endpoints that store one **full snapshot** of
a local SQLite database in **MongoDB Atlas**, so the
[desktop](https://github.com/goddivor/compta-perso-desktop) and
[mobile](https://github.com/goddivor/compta-perso-mobile) apps can hand their data to each other.

Both apps work offline and own their data; this service only holds the snapshot they explicitly
push, and hands it back when they ask for it.

</div>

## 🎖️ Features

- **Snapshot model** — a push replaces the whole cloud copy, a pull replaces the whole local copy, no merge and no conflict resolution
- **Four endpoints** — configuration, push, pull and status, nothing else to learn
- **Self-configuring clients** — an app fetches its URL and token in one call, so nobody types a token by hand
- **Two levels of secret** — a build-time key unlocks the configuration, a bearer token guards the data
- **Warm connection reuse** — the MongoDB client is kept across invocations instead of reconnecting on every request
- **Stateless deployment** — plain serverless functions, no framework, no build step

## 📋 Requirements

- Node.js >= 20
- A MongoDB Atlas cluster and its connection string
- A Vercel account to deploy, or any host able to run serverless functions

## 📦 Installation

```bash
npm install
```

Set four environment variables on the deployment:

| Variable | Role |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB` | Database name, `compta-perso` by default |
| `SYNC_TOKEN` | Bearer token required on every data request |
| `CONFIG_KEY` | Key that unlocks `/api/config` for the apps |

```bash
# Deploy to production
vercel --prod
```

## ⚙️ Usage

Every data endpoint expects `Authorization: Bearer <SYNC_TOKEN>`.

```bash
# What is in the cloud right now
curl -s "$API_URL/api/status" -H "Authorization: Bearer $SYNC_TOKEN"

# Download the whole snapshot
curl -s "$API_URL/api/pull" -H "Authorization: Bearer $SYNC_TOKEN"

# Replace the cloud snapshot with a local one
curl -s -X POST "$API_URL/api/push" \
  -H "Authorization: Bearer $SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device":"pc-thinkpad","data":{"accounts":[],"categories":[],"transactions":[],"forecast_sessions":[]}}'
```

### 🔑 Client configuration

`/api/config` is the only endpoint that does not use the bearer token: it answers to the build-time
key embedded in the apps, and returns the URL and the token they need.

```bash
curl -s "$API_URL/api/config" -H "X-Config-Key: $CONFIG_KEY"
```

```json
{ "ok": true, "api_url": "https://...", "token": "..." }
```

### 📡 Endpoints

| Method | Path | Role |
|---|---|---|
| `GET` | `/api/config` | Return the sync URL and token, guarded by `X-Config-Key` |
| `POST` | `/api/push` | Replace the cloud snapshot with the payload |
| `GET` | `/api/pull` | Return the full snapshot |
| `GET` | `/api/status` | Return the metadata: last push date, device, row counts |

### 🗄️ Data shape

Collections mirror the SQLite tables: `accounts`, `categories`, `transactions`,
`forecast_sessions`, plus a `meta` document describing the last push.

```json
{
  "device": "pc-thinkpad",
  "data": {
    "accounts": [],
    "categories": [],
    "transactions": [],
    "forecast_sessions": []
  }
}
```

### 🌱 First load from an existing database

```bash
./scripts/push-initial-data.sh "$API_URL" "$SYNC_TOKEN" ~/.config/compta-perso/data/compta.db
```

## 🤝 Contributing

Contributions of all kinds are welcome: bug reports, feature ideas and pull requests. Open an
[issue](https://github.com/goddivor/compta-perso-server/issues) first for anything substantial, and
never commit a token, a connection string or an `.env` file.

## 📜 License

Licensed under MIT License and copyrights reserved.
