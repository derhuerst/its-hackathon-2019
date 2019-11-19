#!/bin/bash
set -e

# npm i -g ndjson-cli

# This script assumes that you already have two files positions.ndjson
# (populated using scripts/poll-positions.js) and trips.ndjson (populated
# using scripts/poll-trains-at.js) in place.

reference_fahrt_id=$(cat trips.ndjson | ./scripts/find-reference-fahrt.js)
echo "reference fahrt ID: $reference_fahrt_id"

cat positions.ndjson | grep $reference_fahrt_id | ./scripts/compute-profile.js >reference-profile.json
./scripts/profile-to-geojson.js reference-profile.json >reference-profile.geo.json

ist_fahrt_id=$(
	cat positions.ndjson |
	grep -v $reference_fahrt_id |
	ndjson-filter 'd.lineName === "9"' |
	ndjson-filter 'd.position && d.position.latitude !== 0' |
	head -n 1 |
	jq -r .journeyId
)
echo "ist fahrt ID: $ist_fahrt_id"

cat positions.ndjson | \
	grep $ist_fahrt_id | \
	ndjson-filter 'd.position && d.position.latitude !== 0' | \
	./scripts/positions-to-geo-ndjson.js \
	>ist-positions.geo.ndjson
./scripts/geo-ndjson-to-geojson.js ist-positions.geo.ndjson >ist-positions.geo.json

cat positions.ndjson | grep $ist_fahrt_id | ./scripts/compute-profile.js >ist-profile.json
./scripts/profile-to-geojson.js ist-profile.json >ist-profile.geo.json

# todo