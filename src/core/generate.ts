import fs from 'fs';
import path from 'path';
import { ConfigurationOptions } from 'aws-sdk/lib/config';
import AWS from 'aws-sdk';

function addZeroes<T>(str: T): string {
  return `00${str}`.slice(-2);
}

export interface MigrationModule {
  up(
    awsConfig: ConfigurationOptions,
    ddb: AWS.DynamoDB,
    ddbClient: AWS.DynamoDB.DocumentClient,
  ): Promise<void>;

  down(
    awsConfig: ConfigurationOptions,
    ddb: AWS.DynamoDB,
    ddbClient: AWS.DynamoDB.DocumentClient,
  ): Promise<void>;
}

export const generateName = (name: string): string => {
  const d: Date = new Date();

  return [
    d.getFullYear(),
    addZeroes(d.getMonth()),
    addZeroes(d.getDate()),
    addZeroes(d.getHours()),
    addZeroes(d.getMinutes()),
    addZeroes(d.getSeconds()),
    '-',
    name,
  ].join('');
};

export const generateMigration = (
  name: string,
  inPath: string = '.',
): string => {
  const fileName = generateName(name);
  const template = fs.readFileSync(
    path.join(__dirname, './templates/migration.js'),
  );
  fs.writeFileSync(path.join(inPath, `/${fileName}.js`), template);
  return `${fileName}.js`;
};
