import { parseAdvancedQuery, getAdvancedQueryError } from './advancedQuery';

describe('Advanced search query parsing', () => {
  test('PV name, then properties and tags', () => {
    expect(parseAdvancedQuery('SR*beam iocName=test* archived')).toEqual({ pvName: 'SR*beam', iocName: 'test*', tag1: 'archived' });
  });

  test('a query can start with a property instead of a PV name', () => {
    expect(parseAdvancedQuery('iocName=test* archived')).toEqual({ iocName: 'test*', tag1: 'archived' });
  });

  test('extra spaces do not create empty tags or turn the PV name into a tag', () => {
    expect(parseAdvancedQuery('  SR*   iocName=test  ')).toEqual({ pvName: 'SR*', iocName: 'test' });
  });

  test('a value can contain =', () => {
    expect(parseAdvancedQuery('SR* note=a=b')).toEqual({ pvName: 'SR*', note: 'a=b' });
  });

  test('an empty query has no params', () => {
    expect(parseAdvancedQuery('   ')).toEqual({});
  });
});

describe('Advanced search query errors', () => {
  test('a property without a value is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName='))).toBe('Enter a value after iocName=, or use iocName=* to match any value');
  });

  test('PV names, property values, and tags are fine', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName=test* archived'))).toBe('');
    expect(getAdvancedQueryError(parseAdvancedQuery(''))).toBe('');
  });
});
