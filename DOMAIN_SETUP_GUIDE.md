# Domain Setup & Configuration Guide

## Overview

This guide covers registering and configuring all 10 insurance comparison domains to point to your VPS and work with your GitHub Actions deployment system.

## The 10 Domains You Need

Here are all 10 domains from your monorepo, organized by insurance niche:

| # | Domain | Niche | App | Port |
|---|--------|-------|-----|------|
| 1 | **petcovercompare.com** | Pet Insurance | pet-insurance | 3001 |
| 2 | **disabilityquotehub.com** | Disability Insurance | disability-insurance | 3002 |
| 3 | **cybersmallbizcompare.com** | Cyber Insurance | cyber-insurance | 3003 |
| 4 | **travelinsurancecompare.io** | Travel Insurance | travel-insurance | 3004 |
| 5 | **umbrellainsurancequotes.com** | Umbrella Insurance | umbrella-insurance | 3005 |
| 6 | **motorcycleinsurancehub.com** | Motorcycle Insurance | motorcycle-insurance | 3006 |
| 7 | **sr22insurancequick.com** | SR-22 Insurance | sr22-insurance | 3007 |
| 8 | **weddinginsurancecompare.com** | Wedding Insurance | wedding-insurance | 3008 |
| 9 | **droneinsurancecompare.io** | Drone Insurance | drone-insurance | 3009 |
| 10 | **landlordinsurancecompare.com** | Landlord Insurance | landlord-insurance | 3010 |

## Where to Register Domains

### Recommended Registrars

1. **Namecheap** (https://www.namecheap.com)
   - Affordable (.com typically $8-12/year)
   - Great customer service
   - Easy DNS management
   - Free WHOIS privacy

2. **GoDaddy** (https://www.godaddy.com)
   - Wide domain selection
   - Frequent promotions
   - Integrated with other services

3. **Route 53** (https://aws.amazon.com/route53/)
   - AWS integrated
   - Reliable uptime (99.99%)
   - Automatic zone management
   - Good if you're already in AWS

4. **Google Domains** (https://domains.google)
   - Simple interface
   - Transparent pricing
   - Google Workspace integration

### Domain Cost Estimation

```
.com domains:       $8-15/year each × 7 = $56-105
.io domains:        $30-50/year each × 2 = $60-100

Total annual cost:  ~$116-205
```

**Bulk discount tip**: Some registrars offer discounts when registering multiple domains at once.

## Step-by-Step Registration

### Phase 1: Check Domain Availability

Before registering, verify all domains are available:

```bash
# Check if domains are available (you can do this on registrar sites)
# or use command line:
whois petcovercompare.com
whois disabilityquotehub.com
# ... etc for all 10
```

**If domain is taken**, you may need to:
- Try a variation (add "the-", "-co", "-app", etc.)
- Choose a different TLD (.net, .info, .biz instead of .com)
- Contact current owner (expensive)

### Phase 2: Register All Domains

**Recommended approach**: Register all 10 at once from the same registrar

#### Using Namecheap:

1. Go to https://www.namecheap.com
2. Search for first domain: "petcovercompare.com"
3. Add to cart
4. Search for next domain: "disabilityquotehub.com"
5. Add to cart
6. Repeat for all 10 domains
7. At checkout, look for bulk discount codes
8. Complete purchase
9. Go to "My Domains" to manage

#### Using GoDaddy:

1. Go to https://www.godaddy.com
2. Search each domain and add to cart
3. At checkout, apply any promotional codes
4. Complete purchase
5. Go to "My Products" to manage domains

### Phase 3: Initial Setup

Once domains are registered:

1. **Note down your registrar's DNS management URL**
2. **Get your VPS IP address** (from your VPS provider)
3. **Log into registrar account** and access domain management

## DNS Configuration

### What DNS Does

DNS (Domain Name System) translates domain names to IP addresses.

```
User types:  https://petcovercompare.com
                ↓
DNS lookup:  What's the IP for petcovercompare.com?
                ↓
Response:    It's 192.168.1.100 (your VPS IP)
                ↓
Browser:     Connect to 192.168.1.100
                ↓
Server:      Nginx recognizes petcovercompare.com header
                ↓
Response:    Pet insurance site served
```

### Get Your VPS IP

You'll need your VPS IP address for DNS setup. Find it:

**Option 1: From VPS Provider Dashboard**
- Log into your VPS provider (DigitalOcean, Linode, AWS, etc.)
- Find "Droplet", "Instance", or "VPS" details
- Copy the IPv4 address (looks like: `192.168.1.100`)

**Option 2: From SSH Connection**
```bash
# SSH to your VPS
ssh -p 2222 traffic2u@your-vps-ip

# Inside VPS, run:
hostname -I
# Returns your VPS IP
```

**Option 3: Test from Outside**
```bash
# From your local machine
dig your-vps-domain.com
# Shows the IP if already partially set up
```

**Write down your VPS IP**: `_________________________`

### DNS Setup in Registrar

#### Using Namecheap:

1. Go to Namecheap Dashboard
2. Click **Manage** next to domain (e.g., petcovercompare.com)
3. Go to **Advanced DNS** tab
4. Find **A Record** section
5. Change A record to your VPS IP:
   - **Type**: A Record
   - **Host**: @ (or leave blank)
   - **Value**: Your VPS IP (e.g., 192.168.1.100)
   - **TTL**: 3600 (default)
   - Click **✓** to save

6. **Also add A record for www**:
   - **Type**: A Record
   - **Host**: www
   - **Value**: Your VPS IP
   - **TTL**: 3600
   - Click **✓** to save

7. Repeat for all 10 domains

**Expected result after 15 minutes to 24 hours**:
```bash
nslookup petcovercompare.com
# Should return your VPS IP
```

#### Using GoDaddy:

1. Go to GoDaddy Dashboard
2. Find domain and click **Manage DNS**
3. Find the **A Record** (usually first one)
4. Click **Edit** (pencil icon)
5. Set **Points to** to your VPS IP
6. Click **Save**
7. Find **CNAME record** with Host "www"
8. Click **Edit**
9. Set **Points to** to your domain name (e.g., petcovercompare.com)
10. Click **Save**
11. Repeat for all 10 domains

#### Using Route 53 (AWS):

1. Go to AWS Route 53 console
2. Click **Hosted zones**
3. Create new hosted zone for each domain
4. For each domain, create these records:

**A Record (root)**:
- Name: Leave blank (or @ in some systems)
- Type: A
- Value: Your VPS IP
- TTL: 300

**A Record (www)**:
- Name: www
- Type: A
- Value: Your VPS IP
- TTL: 300

5. Copy the **nameservers** from Route 53
6. Go back to domain registrar where you bought the domain
7. Change nameservers to Route 53 nameservers
8. Wait 15 minutes to 24 hours for propagation

### DNS Propagation

DNS changes don't happen instantly. Typical timeline:

- **Immediately**: Changes saved at registrar
- **15 minutes**: Some DNS servers update
- **1-4 hours**: Most DNS servers update
- **24 hours**: All DNS servers should be updated

**Check propagation status**:
```bash
# Check if DNS is propagated
nslookup petcovercompare.com
# or
dig petcovercompare.com
# or
ping petcovercompare.com
```

**Online tools**:
- https://mxtoolbox.com/nslookup.aspx (search for domain)
- https://dnschecker.org (shows DNS status worldwide)
- https://www.whatsmydns.net (shows propagation progress)

## SSL/TLS Certificates (HTTPS)

### Why SSL Certificates?

All your sites need HTTPS (secure connection). Your nginx.conf expects SSL certificates.

```
http://petcovercompare.com        ❌ Not secure (red lock)
https://petcovercompare.com       ✅ Secure (green lock)
```

### Two Options

#### Option 1: Let's Encrypt (FREE - Recommended)

Free, automated SSL certificates. Valid for 90 days, auto-renew.

**Prerequisites**:
- Domains must already point to your VPS (DNS propagated)
- Certbot installed on VPS
- Port 80 and 443 accessible

**Setup on VPS**:

```bash
# SSH to VPS
ssh -p 2222 traffic2u@your-vps-ip

# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Generate certificates for all 10 domains
sudo certbot certonly --standalone \
  -d petcovercompare.com \
  -d www.petcovercompare.com \
  -d disabilityquotehub.com \
  -d www.disabilityquotehub.com \
  -d cybersmallbizcompare.com \
  -d www.cybersmallbizcompare.com \
  -d travelinsurancecompare.io \
  -d www.travelinsurancecompare.io \
  -d umbrellainsurancequotes.com \
  -d www.umbrellainsurancequotes.com \
  -d motorcycleinsurancehub.com \
  -d www.motorcycleinsurancehub.com \
  -d sr22insurancequick.com \
  -d www.sr22insurancequick.com \
  -d weddinginsurancecompare.com \
  -d www.weddinginsurancecompare.com \
  -d droneinsurancecompare.io \
  -d www.droneinsurancecompare.io \
  -d landlordinsurancecompare.com \
  -d www.landlordinsurancecompare.com

# Or use script approach (easier)
bash scripts/generate-ssl.sh
```

**Auto-renewal**:
```bash
# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Check renewal status
sudo certbot renew --dry-run
```

#### Option 2: Paid SSL Certificate

If you want premium support or extended validation:

- **Comodo/Sectigo**: $70-200/year
- **DigiCert**: $200-500/year
- **GlobalSign**: $100-300/year

Most hosting providers include free SSL with hosting plans.

## Nginx Configuration

Your nginx.conf already includes all 10 domains with SSL setup:

```nginx
# This is already in your nginx.conf
server {
  server_name petcovercompare.com www.petcovercompare.com;
  listen 443 ssl http2;

  ssl_certificate /etc/nginx/ssl/petcovercompare.com/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/petcovercompare.com/privkey.pem;

  location / {
    proxy_pass http://pet-insurance:3000;
  }
}

# Similar blocks for all 10 domains
```

**When you generate SSL certificates**, Certbot places them in:
```
/etc/letsencrypt/live/petcovercompare.com/fullchain.pem
/etc/letsencrypt/live/petcovercompare.com/privkey.pem
# ... etc for each domain
```

Your deployment script should copy these to:
```
/home/traffic2u/ssl/petcovercompare.com/fullchain.pem
/home/traffic2u/ssl/petcovercompare.com/privkey.pem
```

## Complete Setup Checklist

### Phase 1: Registration (1-2 hours)
- [ ] Choose registrar (Namecheap/GoDaddy/Route53/Google Domains)
- [ ] Check availability of all 10 domains
- [ ] Register all 10 domains
- [ ] Set strong password for registrar account
- [ ] Save registrar login info securely
- [ ] Get VPS IP address from provider

### Phase 2: DNS Configuration (1-2 hours)
- [ ] Log into registrar account
- [ ] For each of 10 domains:
  - [ ] Create A record pointing to VPS IP (root)
  - [ ] Create A record for www pointing to VPS IP
  - [ ] Verify records saved
- [ ] Wait for DNS propagation (15 minutes to 24 hours)
- [ ] Test DNS with: `nslookup domain.com`

### Phase 3: SSL Certificates (1 hour)
- [ ] Wait for DNS propagation (if not done)
- [ ] SSH to VPS: `ssh -p 2222 traffic2u@your-vps-ip`
- [ ] Install Certbot: `sudo apt install -y certbot`
- [ ] Generate certificates for all 10 domains
- [ ] Verify certificates installed: `ls /etc/letsencrypt/live/`
- [ ] Set up auto-renewal

### Phase 4: Nginx Configuration (already done)
- [ ] Verify nginx.conf has all 10 domains
- [ ] Verify SSL paths in nginx.conf match certificates
- [ ] Test nginx config: `docker-compose exec nginx nginx -t`
- [ ] Reload nginx: `docker-compose restart nginx`

### Phase 5: Docker & Deployment (automated)
- [ ] Push code to git
- [ ] GitHub Actions automatically:
  - [ ] Detects changes
  - [ ] Deploys changed apps
  - [ ] Routes domains to correct ports
  - [ ] Serves over HTTPS

### Phase 6: Testing & Verification (1 hour)
- [ ] Test each domain in browser: https://petcovercompare.com
- [ ] Verify green lock (secure connection)
- [ ] Check that correct app loads
- [ ] Test form submissions
- [ ] Monitor GitHub Actions logs
- [ ] Monitor VPS logs: `docker-compose logs`

## Testing & Verification

### Test DNS Resolution

```bash
# Test that domains resolve to your VPS IP
nslookup petcovercompare.com
# Should return your VPS IP

dig disabilityquotehub.com
# Should return your VPS IP

# Test all 10 domains quickly
for domain in petcovercompare.com disabilityquotehub.com cybersmallbizcompare.com travelinsurancecompare.io umbrellainsurancequotes.com motorcycleinsurancehub.com sr22insurancequick.com weddinginsurancecompare.com droneinsurancecompare.io landlordinsurancecompare.com; do
  echo "Testing $domain..."
  nslookup $domain
done
```

### Test HTTPS Connection

```bash
# Test that domains are accessible via HTTPS
curl -I https://petcovercompare.com
# Should return 200 OK (or 301 redirect to https)

# Test all 10 domains
for domain in petcovercompare.com disabilityquotehub.com cybersmallbizcompare.com travelinsurancecompare.io umbrellainsurancequotes.com motorcycleinsurancehub.com sr22insurancequick.com weddinginsurancecompare.com droneinsurancecompare.io landlordinsurancecompare.com; do
  echo "Testing https://$domain..."
  curl -I https://$domain 2>&1 | head -1
done
```

### Test in Browser

1. Open browser
2. Go to https://petcovercompare.com
3. Check for green lock (secure connection)
4. Verify correct page loads (pet insurance comparison)
5. Repeat for all 10 domains

**Expected behavior**:
- ✅ Green lock in address bar
- ✅ No certificate warnings
- ✅ Correct content loads for each domain
- ✅ Forms are interactive

### Monitor Deployment

Once domains are set up and deployment is triggered:

**In GitHub Actions**:
1. Push code to your branch
2. Go to GitHub → Actions tab
3. Watch "Smart Deploy to VPS" workflow
4. See real-time logs:
   - ✓ Detect changed apps
   - ✓ Build Docker images
   - ✓ Deploy to correct ports
   - ✓ Route domains via nginx
   - ✓ Verify services running

**On VPS**:
```bash
# SSH to VPS
ssh -p 2222 traffic2u@your-vps-ip
cd /home/traffic2u

# Check all services running
docker-compose ps
# Should show all 10 apps "Up"

# Check nginx routing
docker-compose logs -f nginx
# Should show requests being routed to correct ports

# Test specific domain endpoint
curl -I https://petcovercompare.com
# Should return 200 OK from pet-insurance container
```

## Troubleshooting

### Issue: Domain Not Resolving

**Symptoms**: `nslookup domain.com` returns "not found" or wrong IP

**Solutions**:
1. **Check DNS propagation time**: DNS changes take up to 24 hours
2. **Clear DNS cache**:
   ```bash
   # Windows
   ipconfig /flushdns

   # macOS
   sudo dscacheutil -flushcache

   # Linux
   sudo systemd-resolve --flush-caches
   ```
3. **Verify A records in registrar**:
   - Log into registrar
   - Check domain DNS settings
   - Ensure A record points to correct VPS IP
4. **Use online DNS checker**: https://dnschecker.org
5. **Test from different location**: Try from phone hotspot or VPN

### Issue: Certificate Not Found

**Symptoms**: Browser shows certificate error, unable to access HTTPS

**Solutions**:
1. **Check DNS propagation first**: Certbot needs domain to resolve before generating cert
2. **Verify certificates exist**:
   ```bash
   ls /etc/letsencrypt/live/petcovercompare.com/
   # Should show: fullchain.pem, privkey.pem, cert.pem
   ```
3. **Check nginx config**:
   ```bash
   docker-compose exec nginx nginx -t
   # Should say "successful"
   ```
4. **Regenerate certificates**:
   ```bash
   sudo certbot delete --cert-name petcovercompare.com
   sudo certbot certonly --standalone -d petcovercompare.com -d www.petcovercompare.com
   ```
5. **Restart nginx**:
   ```bash
   docker-compose restart nginx
   ```

### Issue: Mixed Content Warning

**Symptoms**: Browser shows "not fully secure" or mixed content warning

**Causes**: Site has both HTTP and HTTPS content

**Solutions**:
1. Ensure nginx redirects HTTP to HTTPS (already configured)
2. Check app code for hardcoded http:// URLs
3. Test with: `curl -I http://petcovercompare.com`
   - Should redirect to https (301 response)

### Issue: Timeout Accessing Domain

**Symptoms**: `curl https://domain.com` hangs or times out

**Solutions**:
1. **Check if Docker services running**:
   ```bash
   docker-compose ps
   # All apps should show "Up"
   ```
2. **Check if nginx is running**:
   ```bash
   docker-compose logs nginx
   # Should show no errors
   ```
3. **Check firewall**:
   ```bash
   sudo ufw status
   # Should allow 80 and 443
   ```
4. **Check if port 443 is accessible**:
   ```bash
   sudo netstat -tlnp | grep 443
   # Should show nginx listening
   ```
5. **Restart all services**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Issue: Nginx Returns 502 Bad Gateway

**Symptoms**: "502 Bad Gateway" when accessing domain

**Causes**: Nginx can't reach the backend app container

**Solutions**:
1. **Check if app containers running**:
   ```bash
   docker-compose ps pet-insurance
   # Should show "Up"
   ```
2. **Check app health**:
   ```bash
   docker-compose logs pet-insurance
   # Look for startup errors
   ```
3. **Check nginx routing config**:
   ```bash
   docker-compose exec nginx cat /etc/nginx/nginx.conf | grep -A 10 "upstream pet-insurance"
   # Should point to correct port
   ```
4. **Verify services on same network**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```
5. **Test direct connection**:
   ```bash
   curl http://pet-insurance:3000
   # Should return 200 (if app is running)
   ```

## Quick Reference

### All 10 Domains at a Glance

```
1. petcovercompare.com          → pet-insurance (port 3001)
2. disabilityquotehub.com       → disability-insurance (port 3002)
3. cybersmallbizcompare.com     → cyber-insurance (port 3003)
4. travelinsurancecompare.io    → travel-insurance (port 3004)
5. umbrellainsurancequotes.com  → umbrella-insurance (port 3005)
6. motorcycleinsurancehub.com   → motorcycle-insurance (port 3006)
7. sr22insurancequick.com       → sr22-insurance (port 3007)
8. weddinginsurancecompare.com  → wedding-insurance (port 3008)
9. droneinsurancecompare.io     → drone-insurance (port 3009)
10. landlordinsurancecompare.com → landlord-insurance (port 3010)
```

### Key Commands

**Check DNS**:
```bash
nslookup domain.com
```

**Check HTTPS**:
```bash
curl -I https://domain.com
```

**Check services**:
```bash
docker-compose ps
```

**Check logs**:
```bash
docker-compose logs -f service-name
```

**View certificate**:
```bash
sudo certbot certificates
```

**Renew certificates**:
```bash
sudo certbot renew
```

## Next Steps

1. **Register all 10 domains** (use Namecheap or GoDaddy)
2. **Configure DNS** for each domain (point to VPS IP)
3. **Wait for DNS propagation** (up to 24 hours)
4. **Generate SSL certificates** (Let's Encrypt, free)
5. **Test domains** in browser (should show green lock)
6. **Push code** and GitHub Actions will handle deployment
7. **Monitor** GitHub Actions and VPS logs

Once domains are working:
- Users can access all 10 sites via HTTPS
- Automatic deployments work seamlessly
- Smart deployment routes each domain correctly
- SSL renews automatically

---

**Questions?** Refer back to specific sections or check VPS logs with `docker-compose logs`.
