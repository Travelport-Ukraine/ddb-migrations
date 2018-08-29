# AWS DDB Migration :outbox_tray: :inbox_tray:

This tool is create to for AWS DynamoDB(and not only) migration management. 

## How it works?

By default this tool creates state table with default name `__migrations` in AWS DynamoDB with read and write capacity equal to `1`. 

After that you can use `migration:generate` command to generate migration file. 

By default migration tool will look for a `migrations` folder relative to execution path. 

After each successfully applied migration `ddb-migration` store last state do DynamoDB.

## Installation

Run `npm i -S ddb-migration` or to install globally `npm i -g ddb-migration`.

## CLI

CLI has next commands to work with:

### Migrate

```
Migrate commands:
  db:migrate           Run pending migrations
  db:migrate:undo      Undo last migration
  db:migrate:undo:all  Undo all migrations
```

All migrate commands accept next parameters:

```
Options:
  --aws-region       AWS region for cli                                                                               [string] [default: "eu-west-1"]
  --aws-access-key   AWS access key for cli
  --aws-secret-key   AWS secret key for cli
  --migration-table  Migration table name                                                                                   [default: "__migrations"]
  --path             Path to migration(s)                                                                                   [default: "./migrations"]
  ```
  
 ### Generate 
 
 ```
 Generate commands:
  migration:generate   Generate migration with name
```

Parameters:

```
Options:
  --name     Name of migration                                                                                                             [required]
  --path     Path to folder                                                                                                 [default: "./migrations"]
```

## Example of migration

As you see you can use awsConfig here to create any service you need and use it in migrations.

```
module.exports = {
  /**
   *
   * @param aws - AWS config
   * @param ddb - DynamoDB instance
   * @param ddbClient DynamoDB.DocumentClient instance
   * @return {Promise<void>}
   */
  up: async (awsConfig, ddb, ddbClient) => {
  },

  /**
   *
   * @param aws - AWS config
   * @param ddb - DynamoDB instance
   * @param ddbClient DynamoDB.DocumentClient instance
   * @return {Promise<void>}
   */
  down: async (awsConfig, ddb, ddbClient) => {
  },
};

```
