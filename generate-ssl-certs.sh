#!/bin/bash

SSL_DIR="./nginx/ssl"
DAYS_VALID=365
COUNTRY="US"
STATE="State"
CITY="City"
ORG="Social Network"
OU="Development"
CN="localhost"

echo "Generating self-signed SSL certificates for development..."

mkdir -p "$SSL_DIR"

openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$CN" \
    -addext "subjectAltName=DNS:localhost,DNS:social-network.local,DNS:*.social-network.local,IP:127.0.0.1"

chmod 644 "$SSL_DIR/cert.pem"
chmod 600 "$SSL_DIR/key.pem"

echo "SSL certificates generated successfully!"
echo "Certificate: $SSL_DIR/cert.pem"
echo "Private Key: $SSL_DIR/key.pem"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "For production, use Let's Encrypt or proper CA-signed certificates."
echo ""
echo "To trust this certificate in your browser:"
echo "1. Import $SSL_DIR/cert.pem into your browser's certificate store"
echo "2. Mark it as trusted for identifying websites"
