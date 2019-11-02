#!/usr/bin/env node
'use strict'

const streakBy = (arr, fn) => arr.reduce(({acc, last}, val) => {
	const cmp = fn(val)
	if (cmp === last) {
		const group = acc[acc.length - 1]
		group.push(val)
		return {acc, last: cmp}
	}
	return {
		acc: [...acc, [val]],
		last: cmp
	}
}, {acc: [], last: NaN}).acc

const vs = [[1, 'a'], [1, 'b'], [2, 'c'], [3, 'd'], [3, 'e']]
console.log(streakBy(vs, val => val[0]))
