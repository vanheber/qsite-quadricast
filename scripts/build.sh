#!/usr/bin/env bash
# Build do site. O qsite2-core já copia assets referenciados no CSS e
# reescreve URLs de CSS quando há base_path.
set -euo pipefail
cd "$(dirname "$0")/.."
node ../qsite2-core/lib/publish.js build:all "$@"
