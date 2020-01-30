#!/usr/bin/env node

const argv = require('argv');
const git = require('simple-git')(process.cwd());
const glob = require('glob');
const package = require('./package.json');
const util = require('util');
const { Project } = require('ts-morph');

const globAsync = util.promisify(glob);

const arguments = argv
	.info(
		`Usage: ts-imports-organizer [options] files
	
Organizes the imports within the specified TypeScript files. Files can be listed individually or as glob patterns.

Options:`
	)
	.version(`v${package.version}`)
	.option({
		name: 'stage',
		short: 's',
		type: 'boolean',
		description: 'Stage files in Git after processing',
		example: "'ts-imports-organizer --stage=true' or 'ts-imports-organizer -s true'"
	})
	.run();

if ((arguments.options && arguments.options.help) || !arguments.targets || !arguments.targets.length) {
	argv.help();
	process.exit(0);
}

processFiles(arguments.targets)
	.then(async files => {
		if (!!arguments.options.stage && files.length) {
			await gitAdd(files);
		}
		return files.length;
	})
	.then(count => {
		console.log(`Complete. Organized imports in ${count} files.`);
		process.exit(0);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});

function gitAdd(files) {
	return new Promise((resolve, reject) => {
		git.add(files, (error, data) => (!!error ? reject(error) : resolve(data)));
	});
}

async function processFiles(globs) {
	const matches = await Promise.all(globs.map(fileGlob => globAsync(fileGlob)));
	const files = matches
		.reduce((arr, match) => (match && match.length ? arr.concat(match) : arr), [])
		.filter(file => /\.[jt]s[x]?$/i.test(file));

	if (!files || !files.length) {
		return [];
	}

	console.log('Processing files...');
	const project = new Project({ addFilesFromTsConfig: false, compilerOptions: { allowJs: true } });
	project.addSourceFilesAtPaths(files);
	const promises = project.getSourceFiles().map(async source => {
		const file = source.getFilePath();
		console.log(`- ${file}`);
		source.organizeImports();
		await source.save();
		return file;
	});
	return Promise.all(promises);
}
