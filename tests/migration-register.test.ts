import chai, { expect } from 'chai';
import {
  MigrationLog,
  MigrationRegister,
} from '../src/core/migration-register';
import * as ddbLocal from 'dynamodb-local';

const PORT = 14801;

describe('MigrationRegister tests', function() {
  this.timeout(30000);

  let mr: MigrationRegister;

  before(async () => {
    await ddbLocal.launch(PORT);
    mr = new MigrationRegister({
      aws: { region: 'eu-west-1' },
      ddb: { endpoint: `http://localhost:${PORT}` },
    });
  });

  after(() => {
    ddbLocal.stop(PORT);
  });

  it('should check create class with port', () => {
    expect(mr).not.null;
  });

  it('should not found migration table', async () => {
    const isFound = await mr.isTableCreated();
    expect(isFound).to.be.false;
  });

  it('should throw an error on not created table', async () => {
    try {
      await mr.push({ name: '1' });
      return Promise.reject(new Error('Should throw an error'));
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
    }
  });

  it('should init migration table', async () => {
    const isCreated = await mr.init();
    expect(isCreated).to.be.true;
    const isFound = await mr.isTableCreated();
    expect(isFound).to.be.true;
  });

  it('should check that double init does not crash', async () => {
    await mr.init();
  });

  it('should fetch put migration events to log', async () => {
    await mr.push({ name: '1' });
    await mr.push({ name: '2' });
    await mr.push({ name: '3' });

    const logs = await mr.list();
    const logNames = logs.map((log) => log.name).sort();

    expect(logNames).to.be.deep.eq(['1', '2', '3']);
  });

  it('should throw an error on double pushing an event', async () => {
    try {
      await mr.push({ name: '1' });
      return Promise.reject(new Error('Should throw an error'));
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
    }
  });
});
