#!/bin/bash

# SSL Certificate Generation Script
# Uses Certbot to generate Let's Encrypt certificates

set -e

echo "============================================"
echo "Traffic2u SSL Certificate Setup"
echo "============================================"
echo ""

SSL_DIR="./ssl"
EMAIL="${1:-admin@traffic2umarketing.com}"

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# List of domains
DOMAINS=(
    "petcovercompare.com"
    "disabilityquotehub.com"
    "cybersmallbizcompare.com"
    "travelinsurancecompare.io"
    "umbrellainsurancequotes.com"
    "motorcycleinsurancehub.com"
    "sr22insurancequick.com"
    "weddinginsurancecompare.com"
    "droneinsurancecompare.io"
    "landlordinsurancecompare.com"
)

echo "Setting up SSL certificates for the following domains:"
for domain in "${DOMAINS[@]}"; do
    echo "  • $domain"
done
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot is not installed!"
    echo "Please run: sudo apt-get install -y certbot"
    exit 1
fi

# Generate certificate for each domain
for domain in "${DOMAINS[@]}"; do
    echo "Generating certificate for $domain..."

    # Check if certificate already exists
    if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
        echo "  Certificate already exists for $domain"
        # Copy to local SSL directory
        sudo cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$SSL_DIR/${domain}.crt"
        sudo cp "/etc/letsencrypt/live/$domain/privkey.pem" "$SSL_DIR/${domain}.key"
        sudo chown $USER:$USER "$SSL_DIR/${domain}.crt" "$SSL_DIR/${domain}.key"
    else
        echo "  Creating new certificate..."

        # Generate new certificate
        sudo certbot certonly --standalone \
            -d "$domain" \
            -d "www.$domain" \
            --non-interactive \
            --agree-tos \
            -m "$EMAIL" \
            --key-type rsa \
            --elliptic-curve secp256r1 \
            --rsa-key-size 2048

        # Copy to local SSL directory
        if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
            sudo cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$SSL_DIR/${domain}.crt"
            sudo cp "/etc/letsencrypt/live/$domain/privkey.pem" "$SSL_DIR/${domain}.key"
            sudo chown $USER:$USER "$SSL_DIR/${domain}.crt" "$SSL_DIR/${domain}.key"
            echo "  ✅ Certificate created for $domain"
        fi
    fi
done

# Set up auto-renewal
echo ""
echo "Setting up auto-renewal..."
sudo systemctl enable certbot.timer 2>/dev/null || true

echo ""
echo "============================================"
echo "✅ SSL Setup Complete!"
echo "============================================"
echo ""
echo "Certificates location: $SSL_DIR/"
echo "Auto-renewal enabled via systemd"
echo ""
echo "To renew certificates manually:"
echo "  sudo certbot renew --dry-run"
echo ""
