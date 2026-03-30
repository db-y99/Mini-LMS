# DEPLOYMENT GUIDE
## Y99 Multi-Branch LMS

---

## 🚀 QUICK START

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📦 DEPLOYMENT OPTIONS

### Option 1: Vercel (Recommended for Next.js)

**Easiest deployment - Zero configuration**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Deploy to production
vercel --prod
```

**Or connect GitHub:**
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Auto-deploy on every push

**Pros:**
- ✅ Zero config
- ✅ Auto scaling
- ✅ Global CDN
- ✅ Free tier

---

### Option 2: Docker

**Build and run with Docker**

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Or use docker-compose (includes PostgreSQL + Redis)
npm run docker:compose
```

**Access:**
- App: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

**Stop:**
```bash
npm run docker:down
```

**Pros:**
- ✅ Consistent environment
- ✅ Easy to scale
- ✅ Portable

---

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)

**Manual deployment on a server**

```bash
# 1. SSH to server
ssh user@your-server

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone https://github.com/your-repo/y99-lms
cd y99-lms

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Install PM2 (process manager)
npm install -g pm2

# 7. Start with PM2
pm2 start npm --name "y99-lms" -- start
pm2 save
pm2 startup

# 8. Setup Nginx (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/y99-lms
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/y99-lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Pros:**
- ✅ Full control
- ✅ Cost effective
- ✅ Customizable

---

### Option 4: Railway / Render

**Simple PaaS deployment**

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Render:**
1. Connect GitHub repository
2. Select "Web Service"
3. Build command: `npm run build`
4. Start command: `npm start`

**Pros:**
- ✅ Simple setup
- ✅ Auto scaling
- ✅ Free tier

---

## 🔧 ENVIRONMENT VARIABLES

Create `.env.production`:

```bash
NODE_ENV=production
PORT=3000

# Database (when migrated from localStorage)
DATABASE_URL=postgresql://user:password@host:5432/y99lms

# Redis (for caching)
REDIS_URL=redis://host:6379

# API
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

---

## 📊 SCALING

### Horizontal Scaling

**Docker Compose (multiple instances):**

```yaml
# docker-compose.yml
services:
  app:
    image: y99-lms
    deploy:
      replicas: 3  # Run 3 instances
    ports:
      - "3000-3002:3000"
```

**Or with Nginx load balancer:**

```nginx
upstream app {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### Vertical Scaling

**Increase server resources:**
- Small: 2 CPU, 4GB RAM → 100 users
- Medium: 4 CPU, 8GB RAM → 300 users
- Large: 8 CPU, 16GB RAM → 600 users

---

## 🔍 MONITORING

### Health Check

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "version": "1.0.0"
}
```

### PM2 Monitoring

```bash
# View logs
pm2 logs y99-lms

# Monitor resources
pm2 monit

# View status
pm2 status
```

---

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🛡️ SECURITY

### Production Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set secure environment variables
- [ ] Enable CORS properly
- [ ] Add rate limiting
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Error tracking (Sentry)
- [ ] Access logs

---

## 📝 MAINTENANCE

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart
pm2 restart y99-lms
```

### Database Backup (when using PostgreSQL)

```bash
# Backup
pg_dump -U y99lms y99lms > backup.sql

# Restore
psql -U y99lms y99lms < backup.sql
```

---

## 🆘 TROUBLESHOOTING

### Application won't start

```bash
# Check logs
pm2 logs y99-lms

# Check port
lsof -i :3000

# Restart
pm2 restart y99-lms
```

### High memory usage

```bash
# Check memory
pm2 monit

# Restart application
pm2 restart y99-lms
```

### Database connection issues

```bash
# Test connection
psql -U y99lms -h localhost -d y99lms

# Check DATABASE_URL
echo $DATABASE_URL
```

---

## 📞 SUPPORT

For deployment issues:
1. Check logs: `pm2 logs y99-lms`
2. Check health: `curl http://localhost:3000/api/health`
3. Review documentation
4. Contact support team

---

**Deployment Status:** ✅ Ready for production deployment
