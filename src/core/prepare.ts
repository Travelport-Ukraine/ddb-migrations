import ora from 'ora';

export interface MigrateCommandArgs {
  awsRegion: string;
  awsSecretKey: string;
  awsAccessKey: string;
  migrationTable: string;
  path: string;
}

import { MigrationRegister } from './migration-register';

export async function prepare(
  args: MigrateCommandArgs,
): Promise<MigrationRegister> {
  const register = new MigrationRegister({
    aws: {
      accessKeyId: args.awsAccessKey,
      secretAccessKey: args.awsSecretKey,
      region: args.awsRegion,
    },
    metaDataTable: args.migrationTable,
  });

  const accountId =
    register.awsConfig.accessKeyId ||
    (register.awsConfig.credentials &&
      register.awsConfig.credentials.accessKeyId);

  const spinner = ora(`Fetching data from AWS account ${accountId}`).start();

  const isCreated = await register.isTableCreated();

  spinner.succeed('Fetched meta data');

  if (!isCreated) {
    spinner.start('Creating status table');
    await register.init();
    spinner.succeed('Table created');
  }

  return register;
}
