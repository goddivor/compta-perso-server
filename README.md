# compta-perso-sync-api

Sync API between the compta-perso apps (Electron desktop / Expo mobile) and MongoDB Atlas.

The cloud stores a **full snapshot** of the local SQLite database. Each app works offline
on its own SQLite file, then explicitly pushes or pulls the snapshot.

## Endpoints

All endpoints require `Authorization: Bearer <SYNC_TOKEN>`.

| Method | Path          | Role |
|--------|---------------|------|
| POST   | `/api/push`   | Replace the cloud snapshot with the client's full data |
| GET    | `/api/pull`   | Return the full cloud snapshot |
| GET    | `/api/status` | Return snapshot metadata (last push date, device, row counts) |

### Push body

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

## Environment variables (Vercel)

| Var | Role |
|-----|------|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB`  | Database name (default `compta-perso`) |
| `SYNC_TOKEN`  | Shared secret required on every request |

## Deploy

```bash
vercel --prod
```
