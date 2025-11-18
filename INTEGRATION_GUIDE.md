# Integration Guide - Monitoring Dashboard

This guide shows how to integrate the monitoring dashboard with all your apps across the repository branches.

## Complete App Inventory

### 30 Apps from `analyze-android-app-stores` Branch

1. 01-SnapSave
2. 02-CashFlowMap
3. 03-GigStack
4. 04-VaultPay
5. 05-DebtBreak
6. 06-PeriFlow
7. 07-TeleDocLocal
8. 08-NutriBalance
9. 09-MentalMate
10. 10-ActiveAge
11. 11-TaskBrain
12. 12-MemoShift
13. 13-CodeSnap
14. 14-DraftMate
15. 15-FocusFlow
16. 16-PuzzleQuest
17. 17-CityBuilderLite
18. 18-StoryRunner
19. 19-SkillMatch
20. 20-ZenGarden
21. 21-GuardVault
22. 22-NoTrace
23. 23-CipherText
24. 24-LocalEats
25. 25-ArtisanHub
26. 26-QualityCheck
27. 27-SkillBarter
28. 28-ClimateTrack
29. 29-CrewNetwork
30. 30-AuraRead

### 8 Apps from `business-apps-setup` Monorepo

1. CodeSnap
2. LeadExtract
3. LinkedBoost
4. MenuQR
5. RevenueView
6. TestLift
7. UpdateLog
8. WarmInbox

### Individual App Branches (13+ apps)

1. AI Caption Generator
2. BizBuys Procurement
3. DataCash Monetization
4. EarnHub Student
5. Find App Niches
6. GigCredit Lending
7. ImpactReceipts Charity
8. MediSave Healthcare
9. NeighborCash Local
10. SeasonalEars Gigs
11. SkillSwap Bartering
12. SkilTrade Gig
13. (Additional apps)

**Total: 50+ apps**

---

## Quick Integration Steps

### For All Apps (Recommended Approach)

Each app needs to report metrics daily. Here are the integration patterns:

## 1. Node.js/Next.js Apps (Most of Your Apps)

### Setup

Add to your app's dependencies:
```bash
npm install node-fetch  # if using Node < 18
```

### Create a monitoring helper file

**lib/monitoring.js** (or utils/monitoring.js):

```javascript
// lib/monitoring.js
const DASHBOARD_URL = process.env.MONITORING_DASHBOARD_URL || 'http://localhost:3000';

export async function reportMetrics(appName, metrics) {
  try {
    const payload = {
      appName: appName.toLowerCase().replace(/\s+/g, '-'),
      displayName: appName,
      metrics: {
        users: metrics.users || 0,
        activeUsers: metrics.activeUsers || 0,
        downloads: metrics.downloads || 0,
        revenue: metrics.revenue || 0,
        adImpressions: metrics.adImpressions || 0,
        adClicks: metrics.adClicks || 0,
        sessions: metrics.sessions || 0,
        custom: metrics.custom || {}
      }
    };

    const response = await fetch(`${DASHBOARD_URL}/api/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Monitoring error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to report metrics:', error);
    // Don't crash app if monitoring fails
  }
}

// Helper to get daily metrics
export function getTodayMetrics(db) {
  // Query your database to get metrics for today
  // This is app-specific, implement based on your schema
  return {
    users: 0,        // Total registered users
    activeUsers: 0,  // Users active today
    downloads: 0,    // New downloads today
    revenue: 0,      // Revenue today
    adImpressions: 0,
    adClicks: 0,
    sessions: 0
  };
}
```

### Option A: Report on Startup & Cron Job

**pages/api/cron/metrics.js** (if using Next.js):

```javascript
import { reportMetrics, getTodayMetrics } from '../../../lib/monitoring';
import db from '../../../lib/db';

export default async function handler(req, res) {
  // Verify cron secret if needed
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const metrics = getTodayMetrics(db);
    await reportMetrics('YOUR_APP_NAME', metrics);
    res.json({ success: true });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

Call this endpoint daily using:
- **External service**: EasyCron, cron-job.org
- **Your VPS**: Linux crontab
- **CI/CD**: GitHub Actions scheduled workflow

### Option B: Report on Every User Action

```javascript
// In your API routes
import { reportMetrics, getTodayMetrics } from '../../lib/monitoring';

export default async function someApiRoute(req, res) {
  // ... your business logic ...

  // Report metrics after successful action
  if (shouldReportMetrics()) {
    const metrics = getTodayMetrics(db);
    reportMetrics('YOUR_APP_NAME', metrics).catch(err => {
      console.error('Monitoring failed:', err);
    });
  }

  res.json(result);
}

function shouldReportMetrics() {
  // Report every 100th request to reduce overhead
  return Math.random() < 0.01;
}
```

### Environment Setup

Add to **.env.local**:
```env
NEXT_PUBLIC_APP_NAME=YourAppName
MONITORING_DASHBOARD_URL=http://your-vps-ip:3000
CRON_SECRET=your_secret_cron_key
```

---

## 2. For Business Apps Setup Monorepo

Since this uses Turbo, add monitoring to the shared library:

**packages/monitoring/index.js**:

```javascript
export { reportMetrics, getTodayMetrics } from './metrics';
```

Then use it in each app:

```javascript
// In each app
import { reportMetrics } from '@traffic2u/monitoring';

// In your daily cron/scheduled task
reportMetrics(appName, metrics);
```

---

## 3. Integration Template for Each App

Use this template to update each app:

### Step 1: Copy Monitoring Module

Copy the `lib/monitoring.js` to your app's lib folder.

### Step 2: Update App Metadata

```javascript
// In your monitoring.js or equivalent
const APP_CONFIG = {
  name: 'app-name',           // URL-safe name
  displayName: 'App Display Name',  // Human-readable
  dashboardUrl: process.env.DASHBOARD_URL
};
```

### Step 3: Add Daily Reporting

```javascript
// In your server startup or scheduled task handler
import { reportMetrics, getTodayMetrics } from './lib/monitoring';

// Report daily (e.g., at 11:59 PM)
setInterval(async () => {
  const metrics = getTodayMetrics();
  await reportMetrics(APP_CONFIG.name, metrics);
}, 24 * 60 * 60 * 1000);
```

### Step 4: Test the Integration

```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "your-app-name",
    "displayName": "Your App Display Name",
    "metrics": {
      "users": 100,
      "downloads": 5,
      "revenue": 50.00
    }
  }'

# Then check dashboard
# http://localhost:3000/dashboard
```

---

## 4. For Python/Backend Services

If any apps have Python backends:

```python
# monitoring.py
import requests
from datetime import datetime
import os

class MonitoringClient:
    def __init__(self, app_name, dashboard_url=None):
        self.app_name = app_name
        self.dashboard_url = dashboard_url or os.getenv(
            'MONITORING_DASHBOARD_URL',
            'http://localhost:3000'
        )

    def report(self, metrics):
        """Report metrics to monitoring dashboard"""
        try:
            payload = {
                "appName": self.app_name,
                "displayName": self.app_name.replace('-', ' ').title(),
                "date": datetime.now().strftime("%Y-%m-%d"),
                "metrics": metrics
            }

            response = requests.post(
                f"{self.dashboard_url}/api/metrics",
                json=payload,
                timeout=5
            )

            if response.status_code != 200:
                print(f"Monitoring error: {response.text}")

        except Exception as e:
            print(f"Failed to report metrics: {e}")

# Usage
monitoring = MonitoringClient('my-app')
monitoring.report({
    'users': 100,
    'downloads': 5,
    'revenue': 50.00
})
```

---

## 5. Using Cron Jobs (Linux VPS)

### Option A: Individual App Cron Files

Create `/opt/traffic2u-metrics/cron-jobs/app-metrics.sh`:

```bash
#!/bin/bash

DASHBOARD_URL="http://localhost:3000"

# Array of apps to report for
APPS=(
  "SnapSave|snap-save"
  "CashFlowMap|cash-flow-map"
  "GigStack|gig-stack"
  # ... all 50+ apps
)

for app_config in "${APPS[@]}"; do
  IFS='|' read -r display_name app_name <<< "$app_config"

  # Get metrics from app's database or API
  # This is pseudocode - customize per app
  USERS=$(curl -s http://app-server/api/stats/users)
  DOWNLOADS=$(curl -s http://app-server/api/stats/downloads)
  REVENUE=$(curl -s http://app-server/api/stats/revenue)

  # Send to monitoring dashboard
  curl -X POST $DASHBOARD_URL/api/metrics \
    -H "Content-Type: application/json" \
    -d "{
      \"appName\": \"$app_name\",
      \"displayName\": \"$display_name\",
      \"metrics\": {
        \"users\": $USERS,
        \"downloads\": $DOWNLOADS,
        \"revenue\": $REVENUE
      }
    }" 2>/dev/null

  sleep 1  # Rate limiting
done

echo "Metrics reported at $(date)" >> /var/log/monitoring.log
```

Add to crontab:
```bash
# Run every day at 11:59 PM
59 23 * * * /opt/traffic2u-metrics/cron-jobs/app-metrics.sh
```

### Option B: Python Batch Reporting Script

Create `/opt/traffic2u-metrics/batch_reporter.py`:

```python
#!/usr/bin/env python3
import requests
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import json

DASHBOARD_URL = os.getenv('DASHBOARD_URL', 'http://localhost:3000')
APPS_CONFIG = [
    {'name': 'snap-save', 'display': 'SnapSave', 'endpoint': 'http://snap-save-api/stats'},
    {'name': 'cash-flow-map', 'display': 'CashFlowMap', 'endpoint': 'http://cash-flow-api/stats'},
    # ... all 50+ apps
]

def report_app_metrics(app_config):
    """Report metrics for a single app"""
    try:
        # Get metrics from app's API
        stats_response = requests.get(app_config['endpoint'], timeout=5)
        stats = stats_response.json()

        # Report to monitoring dashboard
        payload = {
            "appName": app_config['name'],
            "displayName": app_config['display'],
            "metrics": {
                "users": stats.get('users', 0),
                "downloads": stats.get('downloads', 0),
                "revenue": stats.get('revenue', 0),
                "sessions": stats.get('sessions', 0)
            }
        }

        response = requests.post(
            f"{DASHBOARD_URL}/api/metrics",
            json=payload,
            timeout=5
        )

        print(f"✓ {app_config['name']}: {response.status_code}")
        return True

    except Exception as e:
        print(f"✗ {app_config['name']}: {e}")
        return False

def main():
    print(f"Reporting metrics at {datetime.now()}")

    # Run in parallel with max 10 concurrent requests
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(report_app_metrics, APPS_CONFIG))

    success_count = sum(results)
    print(f"Reported {success_count}/{len(APPS_CONFIG)} apps successfully")

if __name__ == '__main__':
    main()
```

Run via cron:
```bash
0 0 * * * /usr/bin/python3 /opt/traffic2u-metrics/batch_reporter.py >> /var/log/metrics.log 2>&1
```

---

## 6. Monitoring Dashboard Access

Once integrated:

1. **Access Dashboard**: `http://your-vps-ip:3000/dashboard`
   - Username: Your configured admin username
   - Password: Your configured password

2. **View Metrics**:
   - **Overview**: Total users, downloads, revenue across all apps
   - **Apps Tab**: Individual app performance
   - **Analytics**: 7/30/90 day trends
   - **Settings**: API documentation for integration

---

## 7. Custom Metrics for Each App

For app-specific metrics, use the `custom` field:

```javascript
const metrics = {
  users: 1500,
  revenue: 250.00,
  custom: {
    // App-specific metrics
    "retention_rate": "78%",
    "avg_session_time": "4.5m",
    "premium_users": 150,
    "free_users": 1350,
    "storage_used_gb": 45.2,
    "error_rate": "0.5%"
  }
};

await reportMetrics('your-app', metrics);
```

---

## 8. Dashboard Deployment Checklist

- [ ] Install Node.js dependencies: `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Set strong admin password in `.env`
- [ ] Start monitoring dashboard on VPS
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL/TLS certificate
- [ ] Update `MONITORING_DASHBOARD_URL` in all apps
- [ ] Deploy updated apps with metrics reporting
- [ ] Test metrics reporting with sample data
- [ ] Set up automated backups for SQLite database
- [ ] Verify metrics appear in dashboard
- [ ] Create daily cron job for batch reporting
- [ ] Monitor dashboard performance and disk usage

---

## 9. Rollout Strategy

### Phase 1: Pilot (5 apps)
- Test with 5 representative apps
- Verify metrics accuracy
- Ensure no performance impact

### Phase 2: Gradual (15 apps)
- Deploy to 15 more apps
- Monitor for issues
- Refine metrics collection

### Phase 3: Full Rollout (50+ apps)
- Deploy to all remaining apps
- Daily batch reporting via cron
- Monitor dashboard performance

---

## 10. Troubleshooting

### Metrics Not Appearing

```bash
# Check if dashboard is running
curl http://localhost:3000/health

# Check if app is registered
curl http://localhost:3000/api/apps

# Test manual metric submission
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "test-app",
    "metrics": {"users": 100}
  }'

# Check database
sqlite3 data/monitoring.db "SELECT * FROM apps; SELECT * FROM daily_stats LIMIT 5;"
```

### High CPU Usage

- Reduce reporting frequency
- Batch requests instead of individual calls
- Monitor dashboard auto-refresh interval

### Database Size

- Monitor `data/monitoring.db` file size
- Archive old data if > 1GB
- Consider PostgreSQL for very large scale

---

## 11. Next Steps

1. **Choose integration approach** for each app type
2. **Add monitoring module** to each app
3. **Deploy monitoring dashboard** to VPS
4. **Update all apps** with metrics reporting
5. **Configure cron jobs** for batch reporting
6. **Test dashboard** with sample data
7. **Set up backups** and monitoring

---

For questions or issues with specific apps, refer to the app's README or check `README_MONITORING.md` for general guidance.
