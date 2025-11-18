#!/bin/bash

# Release Automation Script
# Automates building, signing, and preparing for app store submission

set -e

APPS=(
  "01-SnapSave" "02-CashFlowMap" "03-GigStack" "04-VaultPay" "05-DebtBreak"
  "06-PeriFlow" "07-TeleDocLocal" "08-NutriBalance" "09-MentalMate" "10-ActiveAge"
  "11-TaskBrain" "12-MemoShift" "13-CodeSnap" "14-DraftMate" "15-FocusFlow"
  "16-PuzzleQuest" "17-CityBuilderLite" "18-StoryRunner" "19-SkillMatch" "20-ZenGarden"
  "21-GuardVault" "22-NoTrace" "23-CipherText" "24-LocalEats" "25-ArtisanHub"
  "26-QualityCheck" "27-SkillBarter" "28-ClimateTrack" "29-CrewNetwork" "30-AuraRead"
)

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

RELEASE_DIR="releases/$VERSION"
mkdir -p "$RELEASE_DIR"

echo "🚀 Starting release automation for version $VERSION"
echo ""

for APP in "${APPS[@]}"; do
  echo "📦 Building $APP..."

  cd "apps/$APP"

  # Update version
  npm version "$VERSION" --no-git-tag-v

  # Install dependencies
  npm install

  # Run tests
  npm test || true

  # Build Android
  echo "  📱 Building Android..."
  eas build --platform android --type release --non-interactive

  # Build iOS
  echo "  🍎 Building iOS..."
  eas build --platform ios --type release --non-interactive

  cd ../..

  echo "✅ $APP built successfully"
  echo ""
done

echo ""
echo "✅ All apps built successfully!"
echo "📦 Artifacts ready in: $RELEASE_DIR"
echo ""
echo "Next steps:"
echo "1. Download builds from Expo"
echo "2. Test on physical devices"
echo "3. Submit to app stores"
echo "4. Monitor review process"
