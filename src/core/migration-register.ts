import AWS, { DynamoDB } from 'aws-sdk';
import { ConfigurationOptions } from 'aws-sdk/lib/config';
import { Object } from 'aws-sdk/clients/s3';

export interface MigrationLog {
  name: string;
  timestamp: number;
}

export interface MigrationConfig {
  metaDataTable?: string;
  aws?: ConfigurationOptions;
  ddb?: DynamoDB.Types.ClientConfiguration;
}

export interface MigrationState {
  name: string;
  migrations: Array<MigrationLog>;
}

export class MigrationRegister {
  private NAME: string;
  private metaData: Array<MigrationLog>;
  private isCreated?: boolean;
  public ddb: AWS.DynamoDB;
  public ddbClient: AWS.DynamoDB.DocumentClient;
  public awsConfig: ConfigurationOptions;

  constructor(config: MigrationConfig) {
    this.NAME = config.metaDataTable || '__migrations';
    this.metaData = [];

    Object.assign(AWS.config, config.aws);
    this.awsConfig = AWS.config;

    this.ddb = new AWS.DynamoDB(config.ddb);
    this.ddbClient = new AWS.DynamoDB.DocumentClient(config.ddb);
  }

  async isTableCreated(): Promise<boolean> {
    if (this.isCreated !== undefined) {
      return this.isCreated;
    }

    try {
      const describeResult = await this.ddb
        .describeTable({
          TableName: this.NAME,
        })
        .promise();

      this.isCreated = describeResult.Table !== undefined;
    } catch (e) {
      this.isCreated = false;
    }

    return this.isCreated;
  }

  private async createTable(): Promise<boolean> {
    await this.ddb
      .createTable({
        AttributeDefinitions: [
          {
            AttributeName: 'name',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'name',
            KeyType: 'HASH',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
        TableName: this.NAME,
      })
      .promise();

    await this.ddb
      .waitFor('tableExists', {
        TableName: this.NAME,
        $waiter: {
          delay: 5,
        },
      })
      .promise();

    this.isCreated = true;

    return true;
  }

  async init(): Promise<boolean> {
    if (!this.isCreated) {
      return this.createTable();
    }

    return true;
  }

  async push(params: { name: string }): Promise<boolean> {
    if (!this.isCreated) {
      throw new Error('Please create init migration table first');
    }

    const dbItem = await this.ddbClient
      .get({
        TableName: this.NAME,
        Key: { name: 'state' },
      })
      .promise();

    const state = (dbItem.Item as MigrationState) || {
      name: 'state',
      migrations: [],
    };

    if (state.migrations.some((migration) => migration.name === params.name)) {
      throw new Error(`Migration ${params.name} is already applied`);
    }

    state.migrations.push({
      name: params.name,
      timestamp: new Date().valueOf(),
    });

    await this.ddbClient
      .put({
        TableName: this.NAME,
        Item: state,
      })
      .promise();

    return true;
  }

  async pop(): Promise<Array<MigrationLog>> {
    if (!this.isCreated) {
      throw new Error('Please create init migration table first');
    }

    const dbItem = await this.ddbClient
      .get({
        TableName: this.NAME,
        Key: { name: 'state' },
      })
      .promise();

    const state = (dbItem.Item as MigrationState) || {
      name: 'state',
      migrations: [],
    };

    if (state.migrations.length) {
      state.migrations.pop();

      await this.ddbClient
        .put({
          TableName: this.NAME,
          Item: state,
        })
        .promise();
    }

    return state.migrations;
  }

  async list(): Promise<Array<MigrationLog>> {
    const scanResponse = await this.ddbClient
      .get({
        TableName: this.NAME,
        Key: { name: 'state' },
      })
      .promise();

    const state = scanResponse.Item as MigrationState;

    return state ? state.migrations : [];
  }
}
