#!/usr/bin/env node

const argv = require('argv');
const glob = require('glob');
const package = require('./package.json');
const util = require('util');
const { Project } = require('ts-morph');

const globAsync = util.promisify(glob);

const arguments = argv
	.version(`v${package.version}`)
	.option({ name: 'files', short: 'f', type: 'list,string', description: 'List of files or glob patterns of files to process' })
	.run();

if (!arguments.options || arguments.options.help || !arguments.options.files || !arguments.options.files.length) {
	argv.help();
	process.exit(0);
}

processFiles(arguments.options.files)
	.then(count => {
		console.log(`Organized imports in ${count} files`);
		process.exit(0);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});

async function processFiles(globs) {
	const matches = await Promise.all(globs.map(fileGlob => globAsync(fileGlob)));
	const files = matches.reduce((arr, match) => (match && match.length ? arr.concat(match) : arr), []);

	if (!files || !files.length) {
		console.log('No files to process');
		return;
	}

	const project = new Project();
	files.forEach(file => {
		const source = project.addSourceFileAtPath(file);
		source.organizeImports();
	});
	await project.save();
	return files.length;
}
