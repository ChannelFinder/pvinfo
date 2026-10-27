import { parseAdvancedQuery, readSearchParams, getAdvancedQueryError } from './advancedQuery';

describe('Advanced search query parsing', () => {
  test('PV name, then properties and tags', () => {
    expect(parseAdvancedQuery('SR*beam iocName=test* archived')).toEqual({ pvName: 'SR*beam', iocName: 'test*', tag: ['archived'] });
  });

  test('a query can start with a property instead of a PV name', () => {
    expect(parseAdvancedQuery('iocName=test* archived')).toEqual({ iocName: 'test*', tag: ['archived'] });
  });

  test('extra spaces do not create empty tags or turn the PV name into a tag', () => {
    expect(parseAdvancedQuery('  SR*   iocName=test  ')).toEqual({ pvName: 'SR*', iocName: 'test' });
  });

  test('several tags are a list', () => {
    expect(parseAdvancedQuery('SR* archived voltage')).toEqual({ pvName: 'SR*', tag: ['archived', 'voltage'] });
  });

  test('a value can contain =', () => {
    expect(parseAdvancedQuery('SR* note=a=b')).toEqual({ pvName: 'SR*', note: 'a=b' });
  });

  test('an empty query has no params', () => {
    expect(parseAdvancedQuery('   ')).toEqual({});
  });
});

describe('Reading search params from the URL', () => {
  test('tags are a list', () => {
    expect(readSearchParams(new URLSearchParams('pvName=SR*&tag=archived&tag=golden&standardSearch=false')))
      .toEqual({ pvName: 'SR*', tag: ['archived', 'golden'], standardSearch: 'false' });
  });

  test('numbered tags from links before 3.0 are read into the list', () => {
    expect(readSearchParams(new URLSearchParams('pvName=*&tag1=archived&tag2=golden')))
      .toEqual({ pvName: '*', tag: ['archived', 'golden'] });
  });

  test('empty values and properties with tag in the name are not tags', () => {
    expect(readSearchParams(new URLSearchParams('pvName=&voltage=5&tag=')))
      .toEqual({ voltage: '5' });
  });
});

describe('Advanced search query errors', () => {
  test('a property without a value is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName='))).toBe('Enter a value after iocName=, or use iocName=* to match any value');
  });

  test('a property with tag in the name but no value is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('* voltage='))).toBe('Enter a value after voltage=, or use voltage=* to match any value');
    expect(getAdvancedQueryError(parseAdvancedQuery('* stage='))).toBe('Enter a value after stage=, or use stage=* to match any value');
  });

  test('PV names, property values, and tags are fine', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName=test* archived'))).toBe('');
    expect(getAdvancedQueryError(parseAdvancedQuery(''))).toBe('');
  });
});
