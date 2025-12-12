# QuickSell API Credentials Location

**IMPORTANT**: API credentials are stored securely on the VPS and are NOT committed to Git.

## Location on VPS

**File**: `/var/www/quicksell.monster/CREDENTIALS_BACKUP.txt`
**Permissions**: 600 (read/write by root only)

## How to Access

```bash
ssh root@72.60.114.234
cat /var/www/quicksell.monster/CREDENTIALS_BACKUP.txt
```

## Credentials Stored

1. **OpenAI API Key** - For AI photo analysis
2. **eBay API Keys** - Sandbox credentials for testing
   - App ID (Client ID)
   - Dev ID
   - Cert ID (Client Secret)
3. **JWT Secret** - Secure session token
4. **Database credentials**

## Current Configuration

- **eBay Mode**: SANDBOX (testing)
- **OpenAI**: Production key (working)
- **JWT**: Cryptographically secure

## When Moving to Production eBay

1. Get production eBay keys from eBay Developer Program
2. Update `/var/www/quicksell.monster/backend/.env`
3. Set `EBAY_SANDBOX=false`
4. Update OAuth URLs to production:
   - `EBAY_OAUTH_URL=https://auth.ebay.com/oauth2/authorize`
   - `EBAY_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token`
5. Restart backend: `docker restart quicksell-backend`

## Security Notes

- Credentials file is never committed to Git
- Only accessible by root user on VPS
- Backed up in `/var/www/quicksell.monster/CREDENTIALS_BACKUP.txt`
- Also configured in `/var/www/quicksell.monster/backend/.env`

---

**Last Updated**: December 12, 2025
**VPS**: 72.60.114.234 (Hostinger)
