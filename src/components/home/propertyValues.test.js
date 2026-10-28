import { getPropertyValues, getExactMatchProperties, pvRecordTypes, pvStatuses } from './propertyValues';

const configOverrides = vi.hoisted(() => ({}));
vi.mock('../../config', async (importOriginal) => {
  const actual = (await importOriginal()).default;
  return { default: new Proxy({ ...actual }, { get: (target, key) => (key in configOverrides ? configOverrides[key] : target[key]) }) };
});

beforeEach(() => {
  Object.assign(configOverrides, {
    CF_RECORD_TYPE: false,
    EXTRA_PROP: null,
    EXTRA_PROP_DROPDOWN_LABELS: [],
    SECOND_EXTRA_PROP: null,
    SECOND_EXTRA_PROP_DROPDOWN_LABELS: [],
    PROPERTY_VALUES: '',
  });
});

test('only pvStatus by default, without * since leaving pvStatus out of the query already matches any status', () => {
  expect(getPropertyValues()).toEqual({ pvStatus: ['Active', 'Inactive'] });
});

test('parses property values in the configured order, ignoring spaces and empty entries', () => {
  configOverrides.PROPERTY_VALUES = ' Acc: GTB, BR ,SR, ; Field:Monitor,On;; Empty: ;NoColon';
  expect(getPropertyValues()).toEqual({ pvStatus: pvStatuses, Acc: ['GTB', 'BR', 'SR'], Field: ['Monitor', 'On'] });
});

test('includes record types and extra property dropdown labels', () => {
  Object.assign(configOverrides, {
    CF_RECORD_TYPE: true,
    EXTRA_PROP: 'archive',
    EXTRA_PROP_DROPDOWN_LABELS: ['Fast', 'Slow'],
    SECOND_EXTRA_PROP: 'irm',
    SECOND_EXTRA_PROP_DROPDOWN_LABELS: ['001'],
  });
  expect(getPropertyValues()).toEqual({ pvStatus: pvStatuses, recordType: pvRecordTypes, archive: ['Fast', 'Slow'], irm: ['001'] });
});

test('extra properties without dropdown labels have no known values', () => {
  configOverrides.EXTRA_PROP = 'archive';
  expect(getPropertyValues()).toEqual({ pvStatus: pvStatuses });
});

test('property values replace other values for the same property', () => {
  Object.assign(configOverrides, {
    EXTRA_PROP: 'archive',
    EXTRA_PROP_DROPDOWN_LABELS: ['Fast', 'Slow'],
    PROPERTY_VALUES: 'archive:VeryFast',
  });
  expect(getPropertyValues()).toEqual({ pvStatus: pvStatuses, archive: ['VeryFast'] });
});

test('properties with known values are an exact match', () => {
  configOverrides.PROPERTY_VALUES = 'Acc:SR';
  expect(getExactMatchProperties()).toEqual(new Set(['pvStatus', 'recordType', 'Acc']));
});
