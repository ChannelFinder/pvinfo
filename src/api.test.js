import api from './api';

const configOverrides = vi.hoisted(() => ({
  CF_RECORD_TYPE: false,
  EXTRA_PROP: 'archive',
  EXTRA_PROP_DROPDOWN_LABELS: ['Fast', 'Slow'],
  SECOND_EXTRA_PROP: 'irm',
  SECOND_EXTRA_PROP_DROPDOWN_LABELS: [],
  PROPERTY_VALUES: 'Sector:1,2,10',
}));
vi.mock('./config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

// run a Channel Finder count query and return the decoded query string that was sent
async function cfQueryString(params) {
  const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(0) }));
  vi.stubGlobal('fetch', fetchMock);
  await api.COUNT_QUERY({ standardSearch: true, ...params });
  const url = new URL(fetchMock.mock.calls[0][0]);
  return decodeURIComponent(url.search);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Channel Finder query parameters', () => {
  test('partial match wildcards are added to a PV name', async () => {
    expect(await cfQueryString({ pvName: 'cmm:' })).toBe('?~name=*cmm:*');
  });

  test('PV name with leading or trailing wildcard is left as is', async () => {
    expect(await cfQueryString({ pvName: 'cmm:*' })).toBe('?~name=cmm:*');
  });

  test('= at the beginning of a PV name is an exact match', async () => {
    expect(await cfQueryString({ pvName: '=cmm:beam_current' })).toBe('?~name=cmm:beam_current');
  });

  test('each pattern of an OR PV name query gets partial match wildcards', async () => {
    expect(await cfQueryString({ pvName: 'VVR|LN_*' })).toBe('?~name=*VVR*|LN_*');
    expect(await cfQueryString({ pvName: 'LTB_*VVR*;LN_*VVR*' })).toBe('?~name=LTB_*VVR*|LN_*VVR*');
  });

  test('space separated words in a PV name must all match in any order', async () => {
    expect(await cfQueryString({ pvName: 'beam current' })).toBe('?~name=*beam*&~name=*current*');
    expect(await cfQueryString({ pvName: '  SR*  current|voltage ' })).toBe('?~name=SR*&~name=*current*|*voltage*');
  });

  test('a PV name of only spaces matches all PVs', async () => {
    expect(await cfQueryString({ pvName: '   ' })).toBe('?~name=*');
  });

  test('commas in a PV name are a single character wildcard instead of an OR', async () => {
    expect(await cfQueryString({ pvName: 'SR01C,BPM' })).toBe('?~name=*SR01C?BPM*');
  });

  test('each pattern of an OR property query gets partial match wildcards', async () => {
    expect(await cfQueryString({ hostName: 'ioc1 | ioc2,ioc3' })).toBe('?~name=*&hostName=*ioc1*|*ioc2*|*ioc3*');
  });

  test('! at the beginning of a property is a not equal query', async () => {
    expect(await cfQueryString({ iocName: '!test' })).toBe('?~name=*&iocName!=*test*');
    // Channel Finder ORs the not equal patterns, so this matches nearly everything, but the wildcards should still be per pattern
    expect(await cfQueryString({ iocName: '!test|sim*' })).toBe('?~name=*&iocName!=*test*|sim*');
  });

  test('= at the beginning of a property is an exact match', async () => {
    expect(await cfQueryString({ iocName: '=myioc|otherioc' })).toBe('?~name=*&iocName=myioc|otherioc');
  });

  test('properties without partial match do not get wildcards', async () => {
    expect(await cfQueryString({ pvStatus: 'Active' })).toBe('?~name=*&pvStatus=Active');
    expect(await cfQueryString({ pvStatus: '!Active' })).toBe('?~name=*&pvStatus!=Active');
    expect(await cfQueryString({ archive: 'Fast' })).toBe('?~name=*&archive=Fast');
  });

  test('an extra property without dropdown labels gets partial match wildcards', async () => {
    expect(await cfQueryString({ irm: '01' })).toBe('?~name=*&irm=*01*');
  });

  test('property values are URL encoded', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(0) }));
    vi.stubGlobal('fetch', fetchMock);
    await api.COUNT_QUERY({ standardSearch: true, hostName: 'a|b#c&d' });
    expect(fetchMock.mock.calls[0][0]).toContain('&hostName=*a*%7C*b%23c%26d*');
  });

  test('advanced search property values get the same wildcards as the standard search, tags are passed through', async () => {
    expect(await cfQueryString({ standardSearch: false, pvName: 'TEST*', recordDesc: 'temp', hostName: '=ioc1', iocName: '!test', tag: ['archived'] }))
      .toBe('?~name=TEST*&recordDesc=*temp*&hostName=ioc1&iocName!=*test*&~tag=archived');
  });

  test('advanced search properties with known values are an exact match', async () => {
    expect(await cfQueryString({ standardSearch: false, Sector: '1|2', archive: '!Fast', recordDesc: 'temp*' }))
      .toBe('?~name=*&Sector=1|2&archive!=Fast&recordDesc=temp*');
  });

  test('each tag is a ~tag parameter and properties with tag in the name are not tags', async () => {
    expect(await cfQueryString({ standardSearch: false, pvName: '*', voltage: '5', tag: ['archived', 'golden'] }))
      .toBe('?~name=*&voltage=*5*&~tag=archived&~tag=golden');
  });
});

describe('PV value formatting', () => {
  const format = api.FORMAT_VALUE;

  test('negative numbers are not shown in exponential form', () => {
    expect(format(-12.5)).toBe('-12.5');
    expect(format(-12.5, 2, 'VDouble')).toBe('-12.50');
  });

  test('the PV precision sets the decimals, keeping trailing zeros like Phoebus', () => {
    expect(format(3.14159, 2, 'VDouble')).toBe('3.14');
    expect(format(3.1, 3, 'VDouble')).toBe('3.100');
    expect(format(0, 2, 'VDouble')).toBe('0.00');
  });

  test('exponential form is used for values that would round to all zeros or are very large', () => {
    expect(format(0.006, 2, 'VDouble')).toBe('0.01');
    expect(format(0.004, 2, 'VDouble')).toBe('4.00e-3');
    expect(format(-0.004, 2, 'VDouble')).toBe('-4.00e-3');
    expect(format(1234567890, 2, 'VDouble')).toBe('1.23e+9');
    expect(format(-1234567890, 2, 'VDouble')).toBe('-1.23e+9');
  });

  test('precision 0 or unknown shows the value in full, since PREC 0 usually means PREC was never set', () => {
    expect(format(3.14159, 0, 'VDouble')).toBe('3.14159');
    expect(format(3.14159)).toBe('3.14159');
    expect(format(0.001)).toBe('1e-3');
    expect(format(-0.001)).toBe('-1e-3');
  });

  test('integer types are whole numbers', () => {
    expect(format(5, 0, 'VInt')).toBe('5');
    expect(format(-5, 0, 'VLong', 2)).toBe('-5');
    expect(format(255, 0, 'VUByte')).toBe('255');
  });

  test('NaN, text and arrays are unchanged', () => {
    expect(format('NaN', 2, 'VDouble')).toBe('NaN');
    expect(format('text')).toBe('text');
  });

  test('the results table caps the decimals at 2, and uses 2 without trailing zeros when the precision is 0 or unknown', () => {
    expect(format(3.14159, 4, 'VDouble', 2)).toBe('3.14');
    expect(format(3.1, 3, 'VDouble', 2)).toBe('3.10');
    expect(format(3.1, 1, 'VDouble', 2)).toBe('3.1');
    expect(format(3.14159, 0, 'VDouble', 2)).toBe('3.14');
    expect(format(3.1, 0, 'VDouble', 2)).toBe('3.1');
    // after a remount the vtype is unknown, so whole numbers don't show as 5.00
    expect(format(5, null, null, 2)).toBe('5');
    expect(format(-0.001, null, null, 2)).toBe('-1.00e-3');
  });

  test('later web socket messages use the precision and vtype from the first message', () => {
    const first = api.PARSE_WEBSOCKET_MSG({ type: 'update', pv: 'SR:temp', value: 12.5, precision: 2, vtype: 'VDouble' });
    expect(first.pv_value).toBe('12.50');
    const update = api.PARSE_WEBSOCKET_MSG({ type: 'update', pv: 'SR:temp', value: 3.14159 }, { precision: first.precision, vtype: first.vtype });
    expect(update.pv_value).toBe('3.14');
  });
});
