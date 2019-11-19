#!/usr/bin/env node
'use strict'

const {
	fetchDeps,
	fetchTrip
} = require('./lib')

const INTERVAL = 10 * 1000

const [station] = process.argv.slice(2)
if (!station) throw new Error('missing station ID')

const print = d => process.stdout.write(JSON.stringify(d) + '\n')

const refreshTrip = (journeyId) => () => {
	fetchTrip(journeyId)
	.then(print)
	.catch(console.error)
}

fetchDeps(station)
.then((deps) => {
	deps.forEach(({journeyId}) => {
		setTimeout(refreshTrip(journeyId), 0)
		setInterval(refreshTrip(journeyId), INTERVAL)
	})
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
