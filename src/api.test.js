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
