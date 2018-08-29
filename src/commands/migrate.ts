import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { Argv } from 'yargs';
import { ConfigurationOptions } from 'aws-sdk/lib/config';

import { baseOptions } from '../core/yargs';
import { generateMigration, MigrationModule } from '../core/generate';
import { MigrationRegister } from '../core/migration-register';
import { MigrateCommandArgs, prepare } from '../core/prepare';

export function builder(yargs: Argv): Argv {
  return baseOptions(yargs)
    .option('migration-table', {
      describe: 'Migration table name',
      default: '__migrations',
    })
    .option('path', {
      describe: 'Path to migration(s)',
      default: './migrations',
    })
    .help();
}

export async function handler(args: MigrateCommandArgs) {
  const spinner = ora();
  const register = await prepare(args);

  spinner.start('Fetching list of migrations from DB');
  const migrationList = await register.list();
  const allMigrations = fs.readdirSync(path.join(process.cwd(), args.path));

  const toApply = allMigrations.filter(
    (migration) => !migrationList.some((m) => m.name === migration),
  );

  if (toApply.length === 0) {
    spinner.fail('All migrations are up-to-date');
    process.exit(0);
  }

  spinner.succeed(
    `Fetched list of already applied migrations. Starting migration of next files: ${toApply.join(
      ', ',
    )}`,
  );

  await toApply.reduce(async (acc, fileName) => {
    await acc;
    const module: MigrationModule = require(path.join(
      process.cwd(),
      args.path,
      fileName,
    ));
    spinner.start(`Starting migration of ${fileName}`);
    await module.up(register.awsConfig, register.ddb, register.ddbClient);
    await register.push({ name: fileName });
    spinner.succeed(`Finished migrating ${fileName}`);
  }, Promise.resolve());

  process.exit(0);
}
