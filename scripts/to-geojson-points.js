#!/usr/bin/env node
'use strict'

const {parse, stringify} = require('ndjson')
const through = require('through2')
const ColorHash = require('color-hash')

const colorHash = str => new ColorHash().hex(str)

process.stdin
.pipe(parse())
.pipe(through.obj((res, _, cb) => {
	if (!res.position) return cb()

	cb(null, {
		type: 'Feature',
		properties: {
			...res,
			'marker-color': colorHash(res.journeyId),
			t: new Date(res.t * 1000).toISOString()
		},
		geometry: {
			type: 'Point',
			coordinates: [
				res.position.longitude,
				res.position.latitude
			]
		}
	})
}))
.pipe(stringify())
.pipe(process.stdout)