#!/usr/bin/env python3
"""
Phase 2: Add design assets, graphics, and branding
This script creates brand guides, design system, and theme files for all apps
"""

import json
from pathlib import Path

APPS_BRANDING = {
    "01-SnapSave": {
        "name": "SnapSave",
        "emoji": "💰",
        "colors": {
            "primary": "#2196F3",
            "secondary": "#1976D2",
            "accent": "#4CAF50",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {
            "heading": "Poppins-Bold",
            "body": "Inter-Regular",
            "mono": "Roboto Mono"
        },
        "messaging": {
            "tagline": "Smart Savings Automation",
            "description": "Automate your savings with AI-powered insights",
            "brand_voice": "Friendly, empowering, financial"
        },
        "assets": {
            "logo_square": "assets/logo-square.png",
            "logo_wide": "assets/logo-wide.png",
            "icon": "assets/icon.png",
            "splash": "assets/splash.png",
            "banner": "assets/banner.png",
            "colors_palette": "assets/colors.json"
        }
    },
    "02-CashFlowMap": {
        "name": "CashFlow Map",
        "emoji": "💳",
        "colors": {
            "primary": "#4CAF50",
            "secondary": "#388E3C",
            "accent": "#2196F3",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Your Financial Dashboard", "description": "Track, analyze, and optimize your finances"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "03-GigStack": {
        "name": "GigStack",
        "emoji": "💼",
        "colors": {
            "primary": "#00BCD4",
            "secondary": "#0097A7",
            "accent": "#FF9800",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Freelancer's Financial Command Center", "description": "Manage invoices, taxes, and earnings"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "04-VaultPay": {
        "name": "VaultPay",
        "emoji": "🔐",
        "colors": {
            "primary": "#FF9800",
            "secondary": "#F57C00",
            "accent": "#2196F3",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Privacy-First Crypto Wallet", "description": "Secure self-custody of your digital assets"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "05-DebtBreak": {
        "name": "DebtBreak",
        "emoji": "🎯",
        "colors": {
            "primary": "#E91E63",
            "secondary": "#C2185B",
            "accent": "#4CAF50",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Gamified Debt Elimination", "description": "Crush your debt with fun and accountability"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "06-PeriFlow": {
        "name": "PeriFlow",
        "emoji": "🌸",
        "colors": {
            "primary": "#FF1493",
            "secondary": "#C71585",
            "accent": "#9C27B0",
            "background": "#FFF5F7",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Women's Health Companion", "description": "Understand your cycle, predict your future"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "07-TeleDocLocal": {
        "name": "TeleDoc Local",
        "emoji": "🏥",
        "colors": {
            "primary": "#2196F3",
            "secondary": "#1976D2",
            "accent": "#4CAF50",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Healthcare in Your City", "description": "Connect with local doctors instantly"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "08-NutriBalance": {
        "name": "NutriBalance",
        "emoji": "🥗",
        "colors": {
            "primary": "#8BC34A",
            "secondary": "#689F38",
            "accent": "#FF5722",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Nutrition Made Personal", "description": "Eat local, stay healthy, live better"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "09-MentalMate": {
        "name": "MentalMate",
        "emoji": "💭",
        "colors": {
            "primary": "#9C27B0",
            "secondary": "#7B1FA2",
            "accent": "#2196F3",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Mental Health Support Community", "description": "Anonymous, supportive, always there"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    },
    "10-ActiveAge": {
        "name": "ActiveAge",
        "emoji": "👵",
        "colors": {
            "primary": "#FF6F00",
            "secondary": "#E65100",
            "accent": "#2196F3",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": "Senior Health Companion", "description": "Care, safety, and independence"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    }
}

# Add remaining apps with similar structure
REMAINING_APPS = [
    ("11-TaskBrain", "TaskBrain", "🧠", "#3F51B5", "#303F9F"),
    ("12-MemoShift", "MemoShift", "📝", "#00BCD4", "#0097A7"),
    ("13-CodeSnap", "CodeSnap", "⚡", "#009688", "#00796B"),
    ("14-DraftMate", "DraftMate", "✍️", "#F44336", "#D32F2F"),
    ("15-FocusFlow", "FocusFlow", "🎯", "#673AB7", "#512DA8"),
    ("16-PuzzleQuest", "PuzzleQuest", "🧩", "#FF6F00", "#E65100"),
    ("17-CityBuilderLite", "CityBuilder Lite", "🏙️", "#4CAF50", "#388E3C"),
    ("18-StoryRunner", "StoryRunner", "📚", "#9C27B0", "#7B1FA2"),
    ("19-SkillMatch", "SkillMatch", "🏆", "#FF1493", "#C71585"),
    ("20-ZenGarden", "ZenGarden", "🌿", "#8BC34A", "#689F38"),
    ("21-GuardVault", "GuardVault", "🔒", "#2196F3", "#1976D2"),
    ("22-NoTrace", "NoTrace", "👻", "#455A64", "#37474F"),
    ("23-CipherText", "CipherText", "🔐", "#00BCD4", "#0097A7"),
    ("24-LocalEats", "LocalEats", "🍜", "#FF6F00", "#E65100"),
    ("25-ArtisanHub", "ArtisanHub", "🎨", "#FF1493", "#C71585"),
    ("26-QualityCheck", "QualityCheck", "⭐", "#4CAF50", "#388E3C"),
    ("27-SkillBarter", "SkillBarter", "🤝", "#3F51B5", "#303F9F"),
    ("28-ClimateTrack", "ClimateTrack", "🌍", "#8BC34A", "#689F38"),
    ("29-CrewNetwork", "CrewNetwork", "👥", "#2196F3", "#1976D2"),
    ("30-AuraRead", "AuraRead", "📖", "#9C27B0", "#7B1FA2")
]

for app_id, name, emoji, primary, secondary in REMAINING_APPS:
    APPS_BRANDING[app_id] = {
        "name": name,
        "emoji": emoji,
        "colors": {
            "primary": primary,
            "secondary": secondary,
            "accent": "#FF9800",
            "background": "#F5F5F5",
            "text": "#333333",
            "error": "#D32F2F"
        },
        "fonts": {"heading": "Poppins-Bold", "body": "Inter-Regular", "mono": "Roboto Mono"},
        "messaging": {"tagline": f"{name} - Your Perfect App", "description": f"Experience {name} today"},
        "assets": {"logo_square": "assets/logo.png", "icon": "assets/icon.png", "splash": "assets/splash.png"}
    }

def create_theme_file(app_path, branding):
    """Create theme configuration file"""
    theme = {
        "colors": branding["colors"],
        "fonts": branding["fonts"],
        "spacing": {
            "xs": 4,
            "sm": 8,
            "md": 16,
            "lg": 24,
            "xl": 32
        },
        "borderRadius": {
            "sm": 4,
            "md": 8,
            "lg": 12,
            "full": 999
        },
        "shadows": {
            "sm": {"shadowColor": "#000", "shadowOffset": {"width": 0, "height": 1}, "shadowOpacity": 0.18, "shadowRadius": 1, "elevation": 1},
            "md": {"shadowColor": "#000", "shadowOffset": {"width": 0, "height": 2}, "shadowOpacity": 0.25, "shadowRadius": 3, "elevation": 3},
            "lg": {"shadowColor": "#000", "shadowOffset": {"width": 0, "height": 4}, "shadowOpacity": 0.3, "shadowRadius": 4, "elevation": 5}
        }
    }

    with open(app_path / "frontend" / "theme.json", "w") as f:
        json.dump(theme, f, indent=2)

def create_brand_guide(app_path, branding):
    """Create brand style guide"""
    brand_voice = branding['messaging'].get('brand_voice', 'Professional, friendly, innovative')
    guide = f"""# {branding['name']} - Brand Style Guide

## Brand Identity

**Emoji**: {branding['emoji']}
**Tagline**: {branding['messaging']['tagline']}
**Description**: {branding['messaging']['description']}
**Brand Voice**: {brand_voice}

## Colors

### Primary Color
- **Hex**: {branding['colors']['primary']}
- **Usage**: Main CTAs, headers, key elements

### Secondary Color
- **Hex**: {branding['colors']['secondary']}
- **Usage**: Secondary elements, backgrounds

### Accent Color
- **Hex**: {branding['colors']['accent']}
- **Usage**: Highlights, badges, notifications

### Background
- **Hex**: {branding['colors']['background']}

### Text
- **Hex**: {branding['colors']['text']}

### Error
- **Hex**: {branding['colors']['error']}

## Typography

- **Heading Font**: {branding['fonts']['heading']}
- **Body Font**: {branding['fonts']['body']}
- **Monospace Font**: {branding['fonts']['mono']}

## Design Assets

- Logo (Square): {branding['assets'].get('logo_square', 'assets/logo.png')}
- Logo (Wide): {branding['assets'].get('logo_wide', 'assets/logo-wide.png')}
- Icon: {branding['assets'].get('icon', 'assets/icon.png')}
- Splash Screen: {branding['assets'].get('splash', 'assets/splash.png')}
- Banner: {branding['assets'].get('banner', 'assets/banner.png')}

## UI Guidelines

### Spacing
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

### Border Radius
- Small: 4px
- Medium: 8px
- Large: 12px
- Full: 999px

### Shadows
- Small: Elevation 1
- Medium: Elevation 3
- Large: Elevation 5

## Component Styling

All components should follow Material Design 3 guidelines with {branding['colors']['primary']} as primary accent.

## Tone & Voice

{brand_voice}

Always maintain a friendly, accessible, and empowering tone in all communications.

---

Generated: 2024-11-18
"""

    with open(app_path / "BRAND_GUIDE.md", "w") as f:
        f.write(guide)

def add_design_system_file(app_path):
    """Create design system component library"""
    design_system = '''// Design System - Component Styling Guide
// This file contains all reusable styles for the app

import { StyleSheet } from 'react-native';

export const designSystem = {
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      lineHeight: 18,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Common Styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
};

export default designSystem;
'''

    with open(app_path / "frontend" / "designSystem.js", "w") as f:
        f.write(design_system)

def add_design_assets(app_path):
    """Create design assets directory and placeholder files"""
    assets_path = app_path / "assets"
    assets_path.mkdir(exist_ok=True)

    # Create placeholder asset files
    asset_files = [
        "logo.png",
        "logo-square.png",
        "logo-wide.png",
        "icon.png",
        "splash.png",
        "banner.png",
        "colors.json"
    ]

    for asset in asset_files:
        if asset == "colors.json":
            colors = {"primary": "#2196F3", "secondary": "#1976D2", "accent": "#FF9800"}
            with open(assets_path / asset, "w") as f:
                json.dump(colors, f, indent=2)
        else:
            # Create empty placeholder files
            (assets_path / asset).touch()

def create_app_store_assets(app_path, branding):
    """Create app store listing assets"""
    store_assets = {
        "googlePlay": {
            "shortDescription": branding['messaging']['tagline'],
            "fullDescription": branding['messaging']['description'],
            "whatsNew": "Version 1.0: Initial release",
            "screenshotPaths": [
                "play-store/screenshot-1.png",
                "play-store/screenshot-2.png",
                "play-store/screenshot-3.png"
            ],
            "featureGraphic": "play-store/feature-graphic.png"
        },
        "appStore": {
            "subtitle": branding['messaging']['tagline'],
            "description": branding['messaging']['description'],
            "releaseNotes": "Version 1.0: Initial release",
            "previewUrls": [
                "app-store/preview-1.png",
                "app-store/preview-2.png",
                "app-store/preview-3.png"
            ]
        },
        "alternativeStores": {
            "AppSumo": {"description": branding['messaging']['description']},
            "FDroid": {"summary": branding['messaging']['tagline']},
            "Aptoide": {"description": branding['messaging']['description']},
            "TapTap": {"description": branding['messaging']['description']}
        }
    }

    with open(app_path / "APP_STORE_ASSETS.json", "w") as f:
        json.dump(store_assets, f, indent=2)

def design_all_apps():
    """Add design assets to all 30 apps"""
    base_path = Path("/home/user/Traffic2umarketing/apps")

    for app_id in sorted(APPS_BRANDING.keys()):
        app_path = base_path / app_id
        if not app_path.exists():
            continue

        branding = APPS_BRANDING[app_id]

        print(f"🎨 Designing {app_id}...")

        # Create design files
        create_theme_file(app_path, branding)
        create_brand_guide(app_path, branding)
        add_design_system_file(app_path)
        add_design_assets(app_path)
        create_app_store_assets(app_path, branding)

        print(f"✅ {app_id} branded and designed")

if __name__ == "__main__":
    print("🎨 Starting design phase...\n")
    design_all_apps()
    print("\n✅ Design assets added to all 30 apps!")
