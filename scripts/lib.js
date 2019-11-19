'use strict'

const Promise = require('pinkie-promise')
const {fetch: _fetch} = require('fetch-ponyfill')({Promise})
const {stringify} = require('qs')
const {Writable} = require('stream')

const endpoint = 'https://innoapi-k8s01-dev-fcd.reisenden.info/2.7/'
const token = 'YXBpdXNlcjpnZWhlaW0xMjM0'

const fetch = async (path, query) => {
	const res = await _fetch(endpoint + path + '?' + stringify(query), {
		headers: {
			accept: 'application/json',
			authorization: 'Basic ' + token
		}
	})

	if (!res.ok) {
		if (res.headers.get('content-type') === 'application/json') {
			const body = await res.json()
			const err = new Error(body.message)
			Object.assign(err, body)
			throw err
		}
		const err = new Error(res.statusText)
		err.statusCode = res.status
		throw err
	}

	return res.json()
}

const fetchDeps = async (stationId) => {
	const data = await fetch('boards/arrival/bystation', {
		provider: 'INNO',
		stationID: stationId
	})

	return (data.boards || []).flatMap((board) => {
		return board.stops.map((dep) => ({
			journeyId: dep.journeyID,
			trainId: dep.train && dep.train.trainID || null,
			typeCode: dep.train && dep.train.typeCode || null,
			lineName: dep.train && dep.train.line || null
		}))
	})
}

const fetchPosition = async ({journeyId, trainId}) => {
	const data = await fetch('train/position/byid', {
		journeyID: journeyId,
		trainID: trainId,
		provider: 'INNO'
	})

	return data && data.trainPosition || null
}

const fetchTrip = async (journeyId) => {
	const data = await fetch('journey/byid', {
		journeyID: journeyId,
		provider: 'INNO'
	})

	return data && data.journey || null
}

const reduceStream = (acc, reduce, done) => {
	return new Writable({
		objectMode: true,
		write: (val, _, cb) => {
			reduce(acc, val)
			cb(null)
		},
		writev: (chunks, _, cb) => {
			for (const {chunk: val} of chunks) reduce(acc, val)
			cb(null)
		},
		final: (cb) => {
			done(acc)
			cb()
		}
	})
}

const exitWithError = (err) => {
	console.error(err)
	process.exit(1)
}

module.exports = {
	fetchDeps,
	fetchPosition,
	fetchTrip,
	reduceStream,
	exitWithError
}