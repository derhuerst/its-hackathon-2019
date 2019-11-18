#!/usr/bin/env node
'use strict'

const {fetchPosition} = require('./lib')

const [journeyId, trainId] = process.argv.slice(2)

fetchPosition({
	journeyId,
	trainId
})
.then((data) => {
	process.stdout.write(JSON.stringify(data) + '\n')
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
