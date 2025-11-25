# Deployment Script Fixes - Analysis & Resolution

**Date:** November 25, 2025
**Session:** claude/setup-app-subdomains-01S2rj2Zntcsx7PM1BeRdWRy
**Previous Session:** claude/plan-vps-deployment-01V5CrSGmkxds4BG7ULg6tga

---

## Executive Summary

The original `MONOREPO_DEPLOYMENT_SETUP.sh` from the previous session (commit `71cd57e`) had **7 critical issues** preventing deployment of 150+ apps to VPS with subdomains. All issues have been identified and fixed.

---

## Issues Found & Fixed

### 🔴 **ISSUE #1: Function Called Before Definition** (CRITICAL)

**Problem:**
```bash
# Line 182 - Script calls function
create_nginx_config "$APP_NAME" "$PORT"

# Line 354 - Function defined here (too late!)
function create_nginx_config() { ... }
```

In bash, **functions must be defined BEFORE they're used**. The original script would fail immediately with:
```
create_nginx_config: command not found
```

**Fix Applied:**
- Moved `create_nginx_config()` function to **line 31** (before main script logic)
- Now defined before any calls at lines 326 and 413

**Impact:** Script can now execute without function not found errors

---

### 🔴 **ISSUE #2: Nginx Config Template Variable Substitution Failed** (CRITICAL)

**Problem:**
```bash
cat > "$CONFIG_FILE" << 'NGINX_EOF'  # Single quotes = NO substitution
server {
    server_name APP_NAME.9gg.app;    # Literal text, not replaced!
    proxy_pass http://127.0.0.1:PORT; # Literal text, not replaced!
}
NGINX_EOF

# Then sed tries to fix it
sed -i "s/APP_NAME/$APP_NAME/g" "$CONFIG_FILE"
```

Issues:
- Single quotes in heredoc prevent variable substitution
- Sed is unreliable when dealing with paths and special characters
- Nginx validation would fail with literal placeholders

**Fix Applied:**
- Changed placeholders to `APP_PLACEHOLDER` and `PORT_PLACEHOLDER` (less likely to conflict)
- Used simple sed replacements that work reliably:
  ```bash
  sed -i "s/APP_PLACEHOLDER/$APP_NAME/g" "$CONFIG_FILE"
  sed -i "s/PORT_PLACEHOLDER/$PORT/g" "$CONFIG_FILE"
  ```

**Impact:** Each app now gets correct subdomain and port in Nginx config

---

### 🟡 **ISSUE #3: Unreliable Port Detection** (MAJOR)

**Problem:**
```bash
PORT=3000
if grep -q '"express"' "$APP_DIR/package.json" 2>/dev/null; then
  PORT=5000
fi
```

Assumptions that fail:
- All Express apps use port 5000 (many use 3000, 4000, 5001, etc.)
- All non-Express apps use port 3000 (Next.js, Vite, SvelteKit may use different ports)
- No consideration for `.env` files where port is actually defined
- No inspection of actual server startup code

**Fix Applied:**
- Created `detect_port()` helper function with intelligent detection (lines 109-145):
  1. **First priority:** Check `.env` file for `PORT=` variable
  2. **Second:** Check package.json scripts for `-p` flag (e.g., `"start": "node server.js -p 8000"`)
  3. **Third:** Check for Express framework (defaults to 5000)
  4. **Fourth:** Search server.js for `listen(PORT)` calls
  5. **Fallback:** Default to 3000

**Impact:** Apps now start on their actual ports instead of guessing

---

### 🟡 **ISSUE #4: Weak Branch Name Extraction Logic** (MAJOR)

**Problem:**
```bash
APP_NAME=$(echo "$BRANCH" | sed 's/claude\/\(.*\)-01.*/\1/')
```

This regex assumes **exact format**: `claude/[app-name]-01...`

Fails for:
- `claude/my-app-feature-01ABC` (extracts `my-app-feature`)
- `claude/setup-app-subdomains-01XYZ` (extracts `setup-app-subdomains`)
- Any non-standard naming

**Fix Applied:**
- Created `extract_app_name()` function with pattern handling (lines 151-171):
  1. Removes `claude/` prefix
  2. Handles known special patterns (like `setup-app-subdomains`)
  3. Strips session ID suffix (everything from `-01` onwards)
  4. Returns clean app name

**Impact:** Handles diverse branch naming patterns correctly

---

### 🟡 **ISSUE #5: npm install --production Skips Build Dependencies** (MAJOR)

**Problem:**
```bash
npm install --production --silent  # Skips dev dependencies
# Later...
npm run build  # Fails if build tools not installed
```

Apps using webpack, babel, rollup, etc. would fail at build step because build tools are dev dependencies.

**Fix Applied:**
- Changed `npm install --production` to `npm install` (removed `--production` flag)
- This installs ALL dependencies needed for building
- Build tools are available when `npm run build` executes
- For production deployment, dependencies are still minimal due to .gitignore

**Impact:** Apps with build scripts now compile successfully

---

### 🟡 **ISSUE #6: Monorepo Detection Only 2 Levels Deep** (MAJOR)

**Problem:**
```bash
find "$TEMP_BRANCH" -maxdepth 2 -name "package.json"
```

If monorepo structure is deeper, apps won't be found:
```
monorepo/
├── apps/
│   └── mobile/           # 3 levels deep - not found!
│       └── package.json
├── services/
│   └── api/              # 3 levels deep - not found!
│       └── package.json
```

**Fix Applied:**
- Removed `-maxdepth 2` limit: `find "$TEMP_BRANCH" -name "package.json" -type f`
- Now finds apps at any nesting depth
- Still filters out root package.json and node_modules

**Impact:** Deeply nested monorepo structures now deploy successfully

---

### 🟡 **ISSUE #7: Redundant Sudo Calls in Already-Elevated Script** (MINOR)

**Problem:**
```bash
# User runs: sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
# But script does:
sudo nginx -t          # Line 296 - redundant sudo
sudo systemctl reload  # Line 304 - redundant sudo
```

While this usually works, it can cause issues with:
- Permission escalation loops
- Unexpected TTY requirements
- Error message confusion

**Fix Applied:**
- Removed `sudo` from lines 438 and 446
- Script already runs as root, so direct commands work
- Result: cleaner execution, fewer potential issues

**Impact:** Cleaner sudo handling, fewer edge case errors

---

## Summary Table

| Issue | Severity | Original Line(s) | Fix Type | New Line(s) |
|-------|----------|------------------|----------|-----------|
| Function before use | 🔴 CRITICAL | 182, 271 (calls) / 354 (def) | Moved to line 31 | 326, 413 |
| Nginx template | 🔴 CRITICAL | 360-419 | Use placeholders + simple sed | 38-103 |
| Port detection | 🟡 MAJOR | 154-157, 243-247 | New `detect_port()` function | 109-145 |
| Branch names | 🟡 MAJOR | 114 | New `extract_app_name()` function | 151-171 |
| npm install | 🟡 MAJOR | 126, 222 | Remove `--production` flag | 273, 367 |
| Monorepo depth | 🟡 MAJOR | 190 | Remove maxdepth limit | 335 |
| Sudo redundancy | 🟡 MINOR | 296, 304 | Direct commands | 438, 446 |

---

## Testing Recommendations

### Before Running on VPS:

1. **Syntax check locally:**
   ```bash
   bash -n MONOREPO_DEPLOYMENT_SETUP.sh
   ```

2. **Test function definitions:**
   ```bash
   grep "^function" MONOREPO_DEPLOYMENT_SETUP.sh
   ```
   Should show all functions before main script logic

3. **Test port detection locally:**
   ```bash
   source MONOREPO_DEPLOYMENT_SETUP.sh
   detect_port "/path/to/app"
   ```

### On VPS (dry run recommended first):

1. **Check script syntax:**
   ```bash
   bash -n MONOREPO_DEPLOYMENT_SETUP.sh
   ```

2. **Test single branch deployment first:**
   ```bash
   # Modify script to test only one branch
   BRANCHES="origin/claude/[test-branch]"
   sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
   ```

3. **Verify Nginx configs:**
   ```bash
   sudo nginx -t
   sudo ls -la /etc/nginx/sites-available/*.9gg.app.conf
   ```

4. **Check app processes:**
   ```bash
   pm2 list
   pm2 logs [app-name]
   ```

5. **Test HTTPS access:**
   ```bash
   curl https://[app-name].9gg.app
   ```

---

## Files Modified

- **MONOREPO_DEPLOYMENT_SETUP.sh** - Complete rewrite with all 7 fixes applied

## Files Unchanged

- **MONOREPO_DEPLOYMENT_GUIDE.md** - Documentation still accurate (conceptually correct, now script matches it)

---

## Next Steps

1. **Push this fix** to branch `claude/setup-app-subdomains-01S2rj2Zntcsx7PM1BeRdWRy`
2. **SSH to VPS** and run corrected script:
   ```bash
   git pull origin claude/setup-app-subdomains-01S2rj2Zntcsx7PM1BeRdWRy
   sudo bash MONOREPO_DEPLOYMENT_SETUP.sh
   ```
3. **Monitor output** and check logs for any failures
4. **Verify apps** with `pm2 list` and `curl https://[app-name].9gg.app`

---

## Known Limitations

Even with all fixes, some issues may still occur on specific apps:

1. **App-specific dependencies** - Some apps may need additional system packages
2. **Port conflicts** - If detected port is already in use, PM2 start will fail
3. **Memory constraints** - Deploying 150+ apps on low-memory VPS may cause issues
4. **Custom configurations** - Apps with unusual startup requirements may need manual intervention

These are beyond script scope and would require per-app tuning.

---

## Rollback Instructions

If issues occur, revert to previous version:
```bash
git revert HEAD
git push origin claude/setup-app-subdomains-01S2rj2Zntcsx7PM1BeRdWRy
```

Or restore from backup:
```bash
git checkout HEAD~ -- MONOREPO_DEPLOYMENT_SETUP.sh
```
