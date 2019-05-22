/* global it, describe, beforeEach, afterEach */
'use strict';
const assert = require('assert');
const mockery = require('mockery');
const sinon = require('sinon');
const path = require('path');

describe('lite-server', () => {
  let browserSyncMock;
  let browserSyncMethodStubs;
  let configDefaultsMock;
  let consoleStubs;
  let callbackStub;

  beforeEach(() => {
    mockery.enable({ useCleanCache: true });

    browserSyncMethodStubs = { init: sinon.stub() };
    browserSyncMock = sinon.stub().returns(browserSyncMethodStubs);
    mockery.registerMock('browser-sync', { create: browserSyncMock });

    consoleStubs = {
      log: sinon.stub(),
      info: sinon.stub()
    };

    configDefaultsMock = {
      server: { middleware: ['m1', 'm2'] }
    };
    mockery.registerMock('./config-defaults', configDefaultsMock);

    callbackStub = sinon.stub();

    mockery.registerAllowables(['path', 'lodash', 'minimist', '../lib/lite-server']);
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should merge configs', () => {
    browserSyncMethodStubs.init.yields();
    configDefaultsMock.a = 1;

    const bsConfigMock = {
      b: 2,
      server: {
        middleware: {
          0: null
        }
      }
    };
    mockery.registerMock(path.resolve('./bs-config'), bsConfigMock);

    const liteServer = require('../lib/lite-server');
    const bs = liteServer({ console: consoleStubs, argv: [] }, callbackStub);

    assert.ok(bs.init, 'returns browsersync');
    assert.ok(
      browserSyncMethodStubs.init.calledWithMatch({
        server: {
          middleware: ['m2']
        },
        a: 1,
        b: 2
      }),
      'configs were merged'
    );
    assert.ok(callbackStub.called, 'callback was called');
  });

  it('should handle missing bs-config', () => {
    mockery.registerAllowable(path.resolve('missing-config'));

    const liteServer = require('../lib/lite-server');
    const bs = liteServer(
      {
        console: consoleStubs,
        argv: [null, null, '-c', 'missing-config']
      },
      callbackStub
    );

    assert.ok(bs.init, 'returns browsersync');
    assert.ok(consoleStubs.info.calledWithMatch('Did not detect'));
  });

  it('should support bs-config as function', () => {
    const bsConfigMock = sinon.stub().returns({ b: 2 });
    mockery.registerMock(path.resolve('./bs-config'), bsConfigMock);

    const liteServer = require('../lib/lite-server');
    const bs = liteServer({ console: consoleStubs, argv: [] }, callbackStub);
    assert.ok(bs.init, 'returns browsersync');

    assert.ok(
      browserSyncMethodStubs.init.calledWithMatch({
        server: {
          middleware: ['m1', 'm2']
        },
        b: 2
      }),
      'configs were merged'
    );
    assert.ok(bsConfigMock.calledWith(bs), 'browsersync passed into bsconfig fn');
  });
});
