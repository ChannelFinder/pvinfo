import { createSearchParams } from 'react-router';
import { parseAdvancedQuery, readSearchParams, getAdvancedQueryError, toAdvancedQuery } from './advancedQuery';

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

  test('tag=name and tag==name are the same as the tag name', () => {
    expect(parseAdvancedQuery('SR* tag=archived tag==golden test')).toEqual({ pvName: 'SR*', tag: ['archived', 'golden', 'test'] });
  });

  test('a value can contain =', () => {
    expect(parseAdvancedQuery('SR* note=a=b')).toEqual({ pvName: 'SR*', note: 'a=b' });
  });

  test('== is an exact match and != is not equal, like = and ! in the standard search', () => {
    expect(parseAdvancedQuery('SR* recordDesc==temp iocName!=test hostName=!sim')).toEqual({ pvName: 'SR*', recordDesc: '=temp', iocName: '!test', hostName: '!sim' });
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

  test('tag= without a tag name is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('* tag='))).toBe('Enter a tag name after tag=');
    expect(getAdvancedQueryError(parseAdvancedQuery('* tag=='))).toBe('Enter a tag name after tag=');
  });

  test('tag!= is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('* tag!=archived'))).toBe("Tags can't be searched for not equal, remove tag!= from the query");
  });

  test('an exact or not equal property without a value is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName=='))).toBe('Enter a value after iocName=, or use iocName=* to match any value');
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName!='))).toBe('Enter a value after iocName=, or use iocName=* to match any value');
  });

  test('PV names, property values, and tags are fine', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* iocName=test* archived'))).toBe('');
    expect(getAdvancedQueryError(parseAdvancedQuery(''))).toBe('');
  });
});

describe('Quotes for values with spaces', () => {
  test('values, PV names and tags in double quotes stay together', () => {
    expect(parseAdvancedQuery('"beam current" recordDesc=="beam current" hostName!="sim host" "my tag" tag="other tag"'))
      .toEqual({ pvName: 'beam current', recordDesc: '=beam current', hostName: '!sim host', tag: ['my tag', 'other tag'] });
  });

  test('an = inside quotes is part of the value, not the operator', () => {
    expect(parseAdvancedQuery('"a=b" "c=d" note="x = y"')).toEqual({ pvName: 'a=b', note: 'x = y', tag: ['c=d'] });
  });

  test('an = inside the quotes of tag= is part of the tag name, not the exact operator', () => {
    expect(parseAdvancedQuery('* tag="=odd" "=odd" tag==odd')).toEqual({ pvName: '*', tag: ['=odd', '=odd', 'odd'] });
  });

  test('=name as the first term is an exact PV name, like the Standard search', () => {
    expect(parseAdvancedQuery('=SR:BPM1 iocName=test')).toEqual({ pvName: '=SR:BPM1', iocName: 'test' });
  });

  test('an unclosed quote is an error', () => {
    const query = 'SR* recordDesc="beam current';
    expect(getAdvancedQueryError(parseAdvancedQuery(query), query)).toBe('Add the closing " after the quoted value, or use ? to match a " character');
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* recordDesc="beam current"'), 'SR* recordDesc="beam current"')).toBe('');
  });

  test('an = without a property name after the first term is an error', () => {
    expect(getAdvancedQueryError(parseAdvancedQuery('SR* =test'))).toBe('Enter a property name before the =');
  });

  test('Standard search values with spaces and = are quoted, keeping the exact and not equal operators outside the quotes', () => {
    expect(toAdvancedQuery({ pvName: '=SR:BPM1', recordDesc: '=beam current', hostName: '!sim host', note: 'a=b', tag: ['my tag', 'c=d'] }))
      .toBe('=SR:BPM1 recordDesc=="beam current" hostName=!"sim host" note=a=b "my tag" "c=d"');
    expect(toAdvancedQuery({ pvName: 'beam current' })).toBe('"beam current"');
    expect(toAdvancedQuery({ tag: ['archived'] })).toBe('* archived');
  });

  test('a literal " in a Standard search value becomes the ? wildcard, so switching to Advanced search is not an unclosed quote', () => {
    const query = toAdvancedQuery({ recordDesc: '6"', hostName: '=beam "current"', tag: ['say "hi"'] });
    expect(query).toBe('* recordDesc=6? hostName=="beam ?current?" "say ?hi?"');
    const params = parseAdvancedQuery(query);
    expect(params).toEqual({ pvName: '*', recordDesc: '6?', hostName: '=beam ?current?', tag: ['say ?hi?'] });
    expect(getAdvancedQueryError(params, query)).toBe('');
  });

  test('the search fields come first in their order, then the other properties and the tags', () => {
    expect(toAdvancedQuery({ pvName: 'SR*', extra: '1', hostName: 'host1', recordDesc: 'temp', tag: ['archived'] }, ['pvName', 'recordDesc', 'iocName', 'hostName']))
      .toBe('SR* recordDesc=temp hostName=host1 extra=1 archived');
  });

  // a Standard search goes to the URL, the Advanced query is made from the URL, and searching it gives the same search
  test.each([
    { pvName: 'beam current', recordDesc: '=beam current', hostName: '!sim host', iocName: 'ioc1|ioc2', alias: 'a=b', tag: ['my tag', 'archived', 'x=y'] },
    { pvName: '=SR:BPM1', recordDesc: 'temp', tag: ['=odd'] },
    { pvName: 'SR*beam', iocName: '=IOC1', pvStatus: 'Active' },
  ])('switching from Standard to Advanced search keeps the same search: %o', (standardParams) => {
    const url = createSearchParams({ ...standardParams, standardSearch: true });
    const { standardSearch, ...urlParams } = readSearchParams(url);
    const advancedParams = parseAdvancedQuery(toAdvancedQuery(urlParams));
    expect(advancedParams).toEqual(standardParams);
    expect(getAdvancedQueryError(advancedParams, toAdvancedQuery(urlParams))).toBe('');
    // quotes never end up in the URL
    expect(createSearchParams(advancedParams).toString()).not.toContain('%22');
  });
});
