#!/bin/bash

# Script to create all 10 insurance comparison sites
# Each site is copied from pet-insurance template and customized

SITES=(
  "disability-insurance-compare:3002:disability"
  "cyber-insurance-compare:3003:cyber"
  "travel-insurance-compare:3004:travel"
  "umbrella-insurance-compare:3005:umbrella"
  "motorcycle-insurance-compare:3006:motorcycle"
  "sr22-insurance-compare:3007:sr22"
  "wedding-insurance-compare:3008:wedding"
  "drone-insurance-compare:3009:drone"
  "landlord-insurance-compare:3010:landlord"
)

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../apps" && pwd)"
TEMPLATE_DIR="$BASE_DIR/pet-insurance-compare"

echo "🚀 Creating 9 additional insurance comparison sites..."
echo "Template: $TEMPLATE_DIR"

for site_info in "${SITES[@]}"; do
  IFS=':' read -r site_name port site_type <<< "$site_info"
  site_path="$BASE_DIR/$site_name"

  if [ -d "$site_path" ]; then
    echo "✅ $site_name already exists, skipping..."
  else
    echo "📦 Creating $site_name..."

    # Copy template
    cp -r "$TEMPLATE_DIR" "$site_path"

    # Update package.json with correct name and port
    sed -i "s/\"name\": \"@traffic2u\\/pet-insurance\"/\"name\": \"@traffic2u\/$site_type-insurance\"/" "$site_path/package.json"
    sed -i "s/\"dev\": \"next dev -p 3001\"/\"dev\": \"next dev -p $port\"/" "$site_path/package.json"

    # Update layout.tsx to reference correct site
    sed -i "s/const site = SITES\\.pet/const site = SITES.$site_type/" "$site_path/src/app/layout.tsx"

    # Update page.tsx to reference correct site
    sed -i "s/const site = SITES\\.pet/const site = SITES.$site_type/" "$site_path/src/app/page.tsx"

    # Update compare page to reference correct site
    sed -i "s/const site = SITES\\.pet/const site = SITES.$site_type/" "$site_path/src/app/compare/page.tsx"

    # Update tailwind config colors
    sed -i "s/SITES\\.pet\\./SITES.$site_type./" "$site_path/tailwind.config.ts"

    echo "   ✅ Created $site_name"
  fi
done

echo ""
echo "✨ All sites created! Run 'npm run dev' to start all sites."
echo ""
echo "Sites running on:"
echo "  Pet Insurance:      http://localhost:3001"
echo "  Disability:         http://localhost:3002"
echo "  Cyber:              http://localhost:3003"
echo "  Travel:             http://localhost:3004"
echo "  Umbrella:           http://localhost:3005"
echo "  Motorcycle:         http://localhost:3006"
echo "  SR22:               http://localhost:3007"
echo "  Wedding:            http://localhost:3008"
echo "  Drone:              http://localhost:3009"
echo "  Landlord:           http://localhost:3010"
