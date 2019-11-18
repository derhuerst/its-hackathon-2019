#!/usr/bin/env node
'use strict'

const {
	fetchDeps,
	fetchPosition
} = require('./lib')

const print = d => process.stdout.write(JSON.stringify(d) + '\n')

const INTERVAL = 3 * 1000

const refreshPosition = (dep) => () => {
	fetchPosition(dep)
	.then((position) => {
		print({
			...dep,
			...position,
			t: Date.now() / 1000 | 0
		})
	})
	.catch(console.error)
}

fetchDeps('8000105')
.then((deps) => {
	deps.forEach((dep) => {
		setTimeout(refreshPosition(dep), 0)
		setInterval(refreshPosition(dep), INTERVAL)
	})
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
