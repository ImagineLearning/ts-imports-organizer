# ts-organize-imports

A command line utility for organizing imports within TypeScript files.

## Installation

This utility is available as an NPM package through GitHub Package Registry or Imagine Learning's private MyGet NPM repository.

```bash
npm install --save-dev @imaginelearning/ts-imports-organizer
```

## Command line flags

```bash
> npx ts-imports-organizer --help

Usage: ts-imports-organizer [options] files

Organizes the imports within the specified TypeScript files. Files can be listed individually
or as glob patterns.

Options:

        --help, -h
                Displays help information about this script
                'ts-imports-organizer -h' or 'ts-imports-organizer --help'

        --version
                Displays version info
                ts-imports-organizer --version

        --stage, -s
                Stage files in Git after processing
                'ts-imports-organizer --stage=true' or 'ts-imports-organizer -s true'
```

-   `--help`: Displays help information.
-   `--version`: Displays current version.
-   `--stage [boolean]`: Stage files in Git after processing. Useful when using in a pre-commit hook.

## Pre-commit hook

You can run `ts-imports-organizer` as a pre-commit hook using [`husky`](https://github.com/typicode/husky) and [`lint-staged`](https://github.com/okonet/lint-staged).

```bash
npm install --save-dev husky lint-staged
```

In `package.json` add:

```json
{
	"husky": {
		"hooks": {
			"pre-commit": "lint-staged"
		}
	},
	"lint-staged": {
		"*.ts": "ts-imports-organizer --stage=true"
	}
}
```

If you want to include a code formatter in your pre-commit hook, such as [`pretty-quick`](https://github.com/azz/pretty-quick),
you can include `ts-imports-organizer` as the first subtask so it runs before the code formatter.

```json
{
	"lint-staged": {
		"*.(ts|js|json|scss|css|htm|html)": [
			"ts-imports-organizer --stage=true",
			"pretty-quick --staged"
		]
	}
}
```

Or you can configure them with separate tasks, but be sure to pass the `--concurrent false` flag to `lint-staged` so each task is run sequentially
(since you'll want `ts-imports-organizer` to run prior to your code formatter or linter).

```json
{
	"husky": {
		"hooks": {
			"pre-commit": "lint-staged --concurrent false"
		}
	},
	"lint-staged": {
		"*.ts": "ts-imports-organizer --stage=true",
		"*.(ts|js|json|scss|css|htm|html)": "pretty-quick --staged"
	}
}
```

## Credits

The heavy lifting for this project was already done, thanks to these libraries:
* [`argv`](https://github.com/codenothing/argv): Node based command line argument parser.
* [`minimatch`](https://github.com/isaacs/minimatch): A minimal matching utility.
* [`simple-git`](https://github.com/steveukx/git-js): A light weight interface for running git commands in any node.js application.
* [`ts-morph`](https://github.com/dsherret/ts-morph): TypeScript Compiler API wrapper. Provides an easier way to programmatically navigate and manipulate TypeScript and JavaScript code.
