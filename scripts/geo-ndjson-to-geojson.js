#!/bin/bash
set -e

cat <<EOF
{
  "type": "FeatureCollection",
  "features": [
EOF

cat $1 | sed '$!s/$/,/'

cat <<EOF
  ]
}
EOF
