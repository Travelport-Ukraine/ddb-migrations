import * as generators from './core/generate';

export * from './core/migration-register';

export const generate = {
  name: generators.generateName,
  migration: generators.generateMigration,
};
