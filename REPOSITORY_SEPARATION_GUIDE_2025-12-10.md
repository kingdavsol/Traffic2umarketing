# Repository Separation Guide: CaptionGenius & QuickSell
**Date**: 2025-12-10
**Status**: LOCAL BRANCHES CREATED - Awaiting Manual Push to New Repos

---

## Executive Summary

Successfully created standalone branches for CaptionGenius and QuickSell with:
- Clean orphan branches (no shared git history)
- Updated CLAUDE.md standing orders for each project
- Enforcement hooks configured (.claude/hooks/)
- All unnecessary Traffic2umarketing files removed

---

## Current State

### Local Branches Created

| Branch Name | Project | Files | Commit |
|-------------|---------|-------|--------|
| `captiongenius-standalone` | CaptionGenius | 60 files | cc4831a |
| `quicksell-standalone` | QuickSell | 164 files | 9bdb4b5 |

### What Each Branch Contains

**CaptionGenius (`captiongenius-standalone`)**:
- Next.js 14 AI caption generator
- OpenAI GPT-4 integration
- Stripe payments
- NextAuth.js authentication
- Prisma/PostgreSQL database
- Claude Code enforcement hooks
- CaptionGenius-specific CLAUDE.md

**QuickSell (`quicksell-standalone`)**:
- React frontend with Redux
- Node.js Express backend
- React Native mobile app
- Docker deployment configs
- Claude Code enforcement hooks
- QuickSell-specific CLAUDE.md

---

## Why Manual Migration Is Required

The Git proxy only allows pushing to branches matching `claude/*` pattern with session IDs. To push to new repositories (`kingdavsol/CaptionGenius` and `kingdavsol/QuickSell`), you need to:

1. Create the repositories on GitHub manually
2. Push from this local clone OR
3. Clone this repo locally and push from there

---

## Migration Steps

### Option A: From This Environment (Requires GitHub Token)

If you have SSH access or can configure a GitHub token:

```bash
# For CaptionGenius
git checkout captiongenius-standalone
git remote add caption-origin git@github.com:kingdavsol/CaptionGenius.git
git push -u caption-origin HEAD:main

# For QuickSell
git checkout quicksell-standalone
git remote add quicksell-origin git@github.com:kingdavsol/QuickSell.git
git push -u quicksell-origin HEAD:main
```

### Option B: Clone Locally and Push (Recommended)

1. **Create new repos on GitHub:**
   - Go to https://github.com/new
   - Create `CaptionGenius` (empty, no README)
   - Create `QuickSell` (empty, no README)

2. **Clone this repo to your local machine:**
```bash
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing
git fetch --all
```

3. **Push CaptionGenius:**
```bash
git checkout captiongenius-standalone
git remote add captiongenius https://github.com/kingdavsol/CaptionGenius.git
git push -u captiongenius HEAD:main
```

4. **Push QuickSell:**
```bash
git checkout quicksell-standalone
git remote add quicksell https://github.com/kingdavsol/QuickSell.git
git push -u quicksell HEAD:main
```

---

## Verification After Migration

### For CaptionGenius
```bash
# Clone the new repo
git clone https://github.com/kingdavsol/CaptionGenius.git
cd CaptionGenius

# Verify structure
ls -la
# Should see: app/, components/, lib/, prisma/, .claude/, CLAUDE.md, README.md, etc.

# Verify hooks
ls -la .claude/hooks/
# Should see: enforce-auto-proceed.sh, enforce-git-safety.sh, enforce-github-first.sh
```

### For QuickSell
```bash
# Clone the new repo
git clone https://github.com/kingdavsol/QuickSell.git
cd QuickSell

# Verify structure
ls -la
# Should see: backend/, frontend/, mobile/, docker-compose.yml, .claude/, CLAUDE.md, etc.

# Verify hooks
ls -la .claude/hooks/
# Should see: enforce-auto-proceed.sh, enforce-git-safety.sh, enforce-github-first.sh
```

---

## Branch Summary in Traffic2umarketing

After migration, the Traffic2umarketing repo should be cleaned up:

**Keep:**
- `main` - Portfolio hub with deployment scripts
- `quicksell` - Original QuickSell branch (for reference)

**Can be deleted after migration:**
- `captiongenius-standalone` - Migrated to kingdavsol/CaptionGenius
- `quicksell-standalone` - Migrated to kingdavsol/QuickSell

---

## Enforcement Hooks Included

Each standalone branch includes these hooks in `.claude/hooks/`:

### enforce-git-safety.sh
- Blocks `git push --force` to main/master
- Blocks `git reset --hard` on protected branches
- Blocks deleting main/master branches

### enforce-github-first.sh
- Blocks direct file writes to VPS via SSH
- Enforces GitHub-first deployment workflow
- Warns on SCP/rsync to /var/www

### enforce-auto-proceed.sh
- Post-execution reminder for auto-proceed policy
- Prompts to continue git workflow after commits

---

## Project-Specific Standing Orders

### CaptionGenius CLAUDE.md
- Web root: `/var/www/captiongenius/`
- Tech: Next.js 14, OpenAI GPT-4, Stripe, Prisma
- Commands: `npm run dev`, `npm run build`

### QuickSell CLAUDE.md
- Web root: `/var/www/quicksell/`
- Live URL: https://quicksell.monster
- Tech: React frontend, Node.js backend, React Native mobile
- Commands: `docker-compose up -d`, `docker-compose -f docker-compose.prod.yml up -d --build`

---

## VPS Deployment After Migration

Once repositories are created, deploy each app:

### CaptionGenius
```bash
ssh root@72.60.114.234
cd /var/www
git clone https://github.com/kingdavsol/CaptionGenius.git captiongenius
cd captiongenius
cp .env.example .env
# Edit .env with production values
npm install
npm run build
pm2 start npm --name captiongenius -- start
```

### QuickSell (Already Deployed)
```bash
# QuickSell is already running at /var/www/quicksell
# Just update the remote:
ssh root@72.60.114.234
cd /var/www/quicksell
git remote set-url origin https://github.com/kingdavsol/QuickSell.git
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Files Changed/Created This Session

1. **Created `captiongenius-standalone` branch** with:
   - CaptionGenius-specific CLAUDE.md
   - Updated README.md with correct clone URL
   - Enforcement hooks in .claude/hooks/

2. **Created `quicksell-standalone` branch** with:
   - QuickSell-specific CLAUDE.md
   - Enforcement hooks in .claude/hooks/
   - Removed Traffic2u-specific files (sshcode, etc.)

3. **This migration guide**

---

## Next Steps

1. [ ] Create `kingdavsol/CaptionGenius` repo on GitHub (empty)
2. [ ] Create `kingdavsol/QuickSell` repo on GitHub (empty)
3. [ ] Clone Traffic2umarketing locally
4. [ ] Push `captiongenius-standalone` to CaptionGenius as main
5. [ ] Push `quicksell-standalone` to QuickSell as main
6. [ ] Verify both repos have correct structure
7. [ ] Update VPS QuickSell remote to new repo
8. [ ] Deploy CaptionGenius to VPS
9. [ ] Delete standalone branches from Traffic2umarketing

---

**Generated**: 2025-12-10
**Session Branch**: claude/repository-restructuring-0177TnDfYiZE2vWhCneZTgNR
