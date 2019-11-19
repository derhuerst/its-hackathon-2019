#!/usr/bin/env node
'use strict'

const {join} = require('path')
const {markerColor} = require('./lib')

const [pathToProfile] = process.argv.slice(2)
if (!pathToProfile) throw new Error('missing path to profile.json')
const profile = require(join(process.cwd(), pathToProfile))

const geojson = {
	type: 'FeatureCollection',
	features: profile.samples.map(({t, tAbs, latitude, longitude}) => ({
		type: 'Feature',
		properties: {
			t,
			tAbs: new Date(tAbs * 1000).toISOString(),
			'marker-color': markerColor(profile.fahrtId),
		},
		geometry: {
			type: 'Point',
			coordinates: [longitude, latitude]
		}
	}))
}

process.stdout.write(JSON.stringify(geojson) + '\n')
