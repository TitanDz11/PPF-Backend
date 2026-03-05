#!/usr/bin/env bash
set -e

# Creates the Newman image with htmlextra reporter
echo "==> Building Newman image..."
docker build -t ppf-newman -f Dockerfile.newman .

echo "==> Running API tests suite..."
# Runs Newman inside the compose network, mounting the current dir to save the HTML report
docker run --rm \
  --network ppf_ppf-net \
  -v "$(pwd)":/etc/newman \
  ppf-newman run collection.json \
  -e environment.json \
  -r cli,htmlextra \
  --reporter-htmlextra-export ./reports/report.html

echo "==> ✅ Tests finished successfully. Report generated at ./reports/report.html"
