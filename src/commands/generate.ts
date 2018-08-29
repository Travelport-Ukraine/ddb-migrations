import { Argv } from 'yargs';
import { generateMigration } from '../core/generate';

interface GenerateCommandArgs {
  name: string;
  path: string;
}

export function builder(yargs: Argv): Argv {
  return yargs
    .option('name', {
      describe: 'Name of migration',
    })
    .option('path', {
      describe: 'Path to folder',
      default: './migrations',
    })
    .demandOption(['name'], 'Please provide name for file to use cli')
    .help();
}

export function handler(args: GenerateCommandArgs) {
  const fileName = generateMigration(args.name, args.path);
  console.log(`Generated file ${fileName}`);
  process.exit(0);
}
