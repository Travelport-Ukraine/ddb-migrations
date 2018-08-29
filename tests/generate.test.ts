import { expect } from 'chai';
import fs from 'fs';
import * as migration from '../src/core/generate';

describe('migrations.ts module', () => {
  it('should test name generation', () => {
    const migrationName = 'test-name';
    const name = migration.generateName(migrationName);
    expect(name).to.have.length(24);
    expect(name.slice(-9)).to.be.eq(migrationName);
  });

  it('shouls generate file with migration', () => {
    const name = migration.generateMigration('test');
    expect(fs.existsSync(`./${name}`));
    fs.unlinkSync(`./${name}`);
  });
});
