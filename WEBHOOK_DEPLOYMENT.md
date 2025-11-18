# Webhook Deployment (Simplest Option)

If GitHub Actions seems complex, use webhooks - GitHub pushes updates to your VPS automatically.

## Step 1: Create Webhook Handler on VPS

Create `~/webhook-receiver.js`:

```javascript
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-change-this';
const PORT = 9000;

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Verify webhook signature
    const signature = req.headers['x-hub-signature-256'];
    const hash = 'sha256=' + crypto
      .createHmac('sha256', SECRET)
      .update(body)
      .digest('hex');

    if (signature !== hash) {
      console.log('❌ Invalid signature');
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }

    try {
      const payload = JSON.parse(body);
      const branch = payload.ref.split('/').pop();
      const appName = branch.split('-')[1]; // Extract from "claude/appname-..."

      console.log(`\n📦 Webhook received for: ${appName} on branch ${branch}`);

      // Deploy
      const appDir = `/home/${process.env.USER}/apps/${appName}`;
      const commands = [
        `cd ${appDir}`,
        `git fetch origin`,
        `git checkout ${branch}`,
        `git pull origin ${branch}`,
        `npm install`,
        `npm run build`,
        `pm2 restart ${appName}`,
      ].join(' && ');

      exec(commands, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Deployment failed: ${error.message}`);
          res.writeHead(500);
          res.end('Deployment failed');
          return;
        }

        console.log(`✅ Successfully deployed ${appName}`);
        res.writeHead(200);
        res.end('Deployment successful');
      });

    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      res.writeHead(400);
      res.end('Bad request');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Webhook receiver listening on port ${PORT}`);
  console.log(`Webhook URL: http://your-vps-ip:${PORT}`);
});
```

## Step 2: Install Webhook Handler

```bash
# SSH into VPS
ssh user@your-vps-ip

# Create systemd service for webhook
sudo tee /etc/systemd/system/webhook-receiver.service << 'EOF'
[Unit]
Description=GitHub Webhook Receiver
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/node /home/ubuntu/webhook-receiver.js
Restart=on-failure
RestartSec=10
Environment="WEBHOOK_SECRET=your-super-secret-key-change-this"

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable webhook-receiver
sudo systemctl start webhook-receiver

# Check status
sudo systemctl status webhook-receiver

# View logs
sudo journalctl -u webhook-receiver -f
```

## Step 3: Set Up Nginx to Route Webhooks

Edit `/etc/nginx/sites-available/apps`:

```nginx
# Add this server block
server {
    listen 80;
    server_name webhook.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx

# Get SSL for webhook domain
sudo certbot certonly --nginx -d webhook.yourdomain.com
```

## Step 4: Add Webhook to GitHub

For **each app repository**:

1. Go to Settings > Webhooks > Add webhook
2. **Payload URL**: `https://webhook.yourdomain.com/`
3. **Content type**: `application/json`
4. **Secret**: Enter same secret as `WEBHOOK_SECRET` above
5. **Which events**: Select "Push events"
6. Check "Active"
7. Click "Add webhook"

Test the webhook - GitHub will show delivery history.

## Step 5: Monitor Deployments

```bash
# View webhook logs
sudo journalctl -u webhook-receiver -f

# View app logs
pm2 logs medisave -f
pm2 logs skilltrade -f

# Test webhook manually
curl -X POST http://localhost:9000 \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=fake" \
  -d '{"ref":"refs/heads/claude/medisave-test"}'
```

## Advantages

✅ No GitHub Actions setup needed
✅ Works with any GitHub plan (including free)
✅ Instant deployments on push
✅ Simple and reliable
✅ Full control over deployment process
✅ Logging built in

## Disadvantages

⚠️ Requires webhook endpoint to be public
⚠️ Manual GitHub secret management
⚠️ More infrastructure to maintain

---

## Full Workflow

1. You push code to GitHub
2. GitHub sends webhook notification
3. Your VPS webhook receiver catches it
4. Automatically deploys the app
5. PM2 restarts the process
6. Users see the update

Simple and effective! 🚀
