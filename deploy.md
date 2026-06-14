# Customer App Production Environment Updates

Use this guide when changing `/var/www/pluto/app/app/.env.production`.

## Rules

- Never commit `.env.production`.
- The customer app runs through PM2 as `pluto-app` on port `4000`.
- `NEXT_PUBLIC_*` values are embedded in the browser bundle during `next build`.
- Never place server secrets in a variable prefixed with `NEXT_PUBLIC_`.
- Reload PM2 only after a successful production build.

## Update The File

```bash
ssh root@13.140.133.199
su - deploy
cd /var/www/pluto/app/app
```

Create a protected backup:

```bash
BACKUP_DIR=/home/deploy/env-backups/customer-app
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
cp -p .env.production "$BACKUP_DIR/.env.production.$(date +%Y%m%d-%H%M%S)"
```

Edit and validate:

```bash
nano .env.production
chmod 600 .env.production
node --env-file=.env.production -e 'if (!process.env.NEXT_PUBLIC_APP_URL || !process.env.NEXT_PUBLIC_API_URL) throw new Error("Required public URLs are missing"); console.log("Environment file parsed successfully")'
```

## Build And Apply

Keep the currently running process online while the build runs:

```bash
NODE_ENV=production npm run build
pm2 reload pluto-app --update-env
pm2 save
sleep 5
curl -fsS http://127.0.0.1:4000 >/dev/null
curl -fsS https://plutobooking.com >/dev/null
pm2 logs pluto-app --lines 50 --nostream
```

Do not reload PM2 if the build fails.

## Roll Back

```bash
cd /var/www/pluto/app/app
BACKUP_DIR=/home/deploy/env-backups/customer-app
LATEST_BACKUP="$(ls -1t "$BACKUP_DIR"/.env.production.* | head -1)"
cp -p "$LATEST_BACKUP" .env.production
chmod 600 .env.production
NODE_ENV=production npm run build
pm2 reload pluto-app --update-env
pm2 save
```

## CI/CD

When a new required build variable is introduced, update the `Build` step in
`.github/workflows/deploy-app.yml`. Store sensitive server-only values as
GitHub secrets, and never expose them through `NEXT_PUBLIC_*`.
