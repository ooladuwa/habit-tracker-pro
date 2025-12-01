/* eslint-env jest, node */
/* global global */
import { jest } from '@jest/globals';

// jest.setup-before.js - Runs BEFORE Jest loads
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });

global.__ExpoImportMetaRegistry = {
  register: () => {},
  resolve: () => ({}),
};

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
