#!/usr/bin/env node
import fs from 'fs';
import yargs from './core/yargs';

interface CliPackage {
  version: string;
}

const cliPackage = JSON.parse(
  fs.readFileSync('../package.json').toString(),
) as CliPackage;

import * as generate from './commands/generate';
import * as migrate from './commands/migrate';
import * as undo from './commands/undo';
import * as undoAll from './commands/undo-all';

const cli = yargs
  .command('db:migrate', 'Run pending migrations', migrate)
  .command('db:migrate:undo', 'Undo last migration', undo)
  .command('db:migrate:undo:all', 'Undo all migrations', undoAll)
  .command('migration:generate', 'Generate migration with name', generate)
  .version(cliPackage.version)
  .wrap(yargs.terminalWidth())
  .strict()
  .help();

const args = cli.argv;

// if no command then show help
if (!args._[0]) {
  cli.showHelp();
}
