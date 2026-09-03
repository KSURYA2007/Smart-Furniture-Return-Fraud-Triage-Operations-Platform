/**
 * Module 9: Deterministic Testing Assertions
 */

export class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

export const assert = {
  equal: (actual, expected, message = '') => {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
        expected,
        actual
      );
    }
  },

  deepEqual: (actual, expected, message = '') => {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new AssertionError(
        message || `Deep equality mismatch: Expected ${expStr}, received ${actStr}`,
        expected,
        actual
      );
    }
  },

  true: (value, message = 'Expected value to be truthy') => {
    if (!value) {
      throw new AssertionError(message, true, value);
    }
  },

  false: (value, message = 'Expected value to be falsy') => {
    if (value) {
      throw new AssertionError(message, false, value);
    }
  },

  inRange: (value, min, max, message = '') => {
    if (typeof value !== 'number' || isNaN(value) || value < min || value > max) {
      throw new AssertionError(
        message || `Expected ${value} to be within range [${min}, ${max}]`,
        `[${min}, ${max}]`,
        value
      );
    }
  },

  defined: (value, message = 'Expected value to be defined and not null') => {
    if (value === undefined || value === null) {
      throw new AssertionError(message, 'defined', value);
    }
  },

  throws: (fn, expectedErrorSnippet = null, message = 'Expected function to throw') => {
    let threw = false;
    let errReceived = null;
    try {
      fn();
    } catch (e) {
      threw = true;
      errReceived = e;
    }

    if (!threw) {
      throw new AssertionError(message, 'Error thrown', 'No error thrown');
    }

    if (expectedErrorSnippet && !errReceived.message.includes(expectedErrorSnippet)) {
      throw new AssertionError(
        `Thrown error "${errReceived.message}" did not contain snippet "${expectedErrorSnippet}"`,
        expectedErrorSnippet,
        errReceived.message
      );
    }
  }
};
