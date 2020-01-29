#!/usr/bin/env node

const args = require('args');
const glob = require('glob');

args.option('help', 'Shows help message').example('ts-imports-organizer files', 'Organize imports on specified files');

const arguments = args.parse(process.argv, args);

if (arguments.help || !arguments.sub || !arguments.sub.length) {
	args.showHelp();
}

const files = arguments.sub.reduce((arr, sub) => {
	const matches = glob(sub);
	return matches && matches.length ? arr.concat(matches) : arr;
}, []);
