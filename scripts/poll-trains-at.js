#!/usr/bin/env node
'use strict'

const {
	fetchDeps,
	fetchPosition
} = require('./lib')

const [station] = process.argv.slice(2)
if (!station) throw new Error('missing station ID')

fetchDeps(station)
.then(deps => Promise.all(deps.map(async (dep) => ({
	dep,
	position: await fetchPosition(dep)
}))))
.then(res => res.filter(res => !!res.position))
.then((data) => {
	process.stdout.write(JSON.stringify(data) + '\n')
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
