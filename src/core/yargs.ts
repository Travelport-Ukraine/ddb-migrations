import yargs, { Argv } from 'yargs';

const args = yargs;

export default args;

export function baseOptions(yargs: Argv) {
  return yargs
    .option('aws-region', {
      describe: 'AWS region for cli',
      default: 'eu-west-1',
      type: 'string',
    })
    .option('aws-access-key', {
      describe: 'AWS access key for cli',
    })
    .option('aws-secret-key', {
      describe: 'AWS secret key for cli',
    });
}
