const mixpanel = require('../src/mixpanel.gs.js');

const fetchMock = jest.fn();
const PROJECT_ID = '12345';
const DEFAULT_DATA = {'data': 'data'};
const SEGMENTATION_REPORT_DATA = {
  data: {
    series: [
      '2023-02-17','2023-02-18'
    ],
    values:
      {
        'User1': {'2023-02-17': 4, '2023-02-18': 1},
        'User2': {'2023-02-17': 9, '2023-02-18': 2},
      }
  }
};

function responseFactory(statusCode=200, content=JSON.stringify(DEFAULT_DATA)) {
  return {
    getResponseCode: () => statusCode,
    getContentText: () => content,
  };
}

describe('MixpanelApi', () => {
  let api;

  beforeAll(() => {
    global.UrlFetchApp = {
      fetch: fetchMock,
    };
  });

  beforeEach(() => {
    api = new mixpanel.MixpanelApi('user', 'key', PROJECT_ID);
  });

  describe('segmentationReport', () => {
    beforeEach(() => {
      fetchMock.mockReturnValue(responseFactory(200, JSON.stringify(SEGMENTATION_REPORT_DATA)));
    });
    it('returns flat data', () => {
      const flatData = api.segmentationReport(
        {event: 'Login', on: 'user["name"]'},
        {dateColumn: 'Login date', keyColumn: 'Name', valueColumn: 'Count'}
      );
      expect(flatData).toEqual([
        ['Login date', 'Name', 'Count'],
        ['2023-02-17', 'User1', 4],
        ['2023-02-18', 'User1', 1],
        ['2023-02-17', 'User2', 9],
        ['2023-02-18', 'User2', 2],
      ]);
    });
  });

  describe('flattenSegmentationData', () => {
    it('returns headers according to options', () => {
      const flatData = api.flattenSegmentationData(
        SEGMENTATION_REPORT_DATA,
        { dateColumn: 'Login date', keyColumn: 'Name', valueColumn: 'Count' }
      );
      expect(flatData[0]).toEqual(['Login date', 'Name', 'Count']);
    });
    it('returns flat data from the segmentation response', () => {
      const flatData = api.flattenSegmentationData(SEGMENTATION_REPORT_DATA, {});
      expect(flatData).toEqual([
        ['Date', 'Key', 'Value'],
        ['2023-02-17', 'User1', 4],
        ['2023-02-18', 'User1', 1],
        ['2023-02-17', 'User2', 9],
        ['2023-02-18', 'User2', 2],
      ]);
    });
    it('sums up all buckets if sumBuckets is true', () => {
      const flatData = api.flattenSegmentationData(SEGMENTATION_REPORT_DATA, { sumBuckets: true });
      expect(flatData).toEqual([
        ['Key', 'Value'],
        ['User1', 5],
        ['User2', 11],
      ]);
    });
  });

  describe('buildUrl', () => {
    const someUrl = 'https://some.com/api/endpoint';
    it('builds a url with query params', () => {
      const url = api.buildUrl(someUrl, { event: 'event', on: 'on' });
      expect(url).toEqual(`${someUrl}?event=event&on=on`);
    });
    it('builds a url with multiple query params', () => {
      const url = api.buildUrl(someUrl, { event: 'event', on: ['on1', 'on2'] });
      expect(url).toEqual(`${someUrl}?event=event&on=on1&on=on2`);
    });
  });

  describe('request', () => {
    it('returns data if success', () => {
      fetchMock.mockReturnValueOnce(responseFactory(200, JSON.stringify(DEFAULT_DATA)));
      const result = api.request('path', { event: 'event', on: 'user["name"]' });
      expect(result).toEqual(DEFAULT_DATA);
    });
    it('adds project_id to query params', () => {
      fetchMock.mockReturnValueOnce(responseFactory());
      api.request('path', { event: 'event', on: 'on' });
      expect(fetchMock).toHaveBeenCalledWith(
        `${api.baseUrl}path?event=event&on=on&project_id=${PROJECT_ID}`,
        expect.anything()
      );
    });
    it('throws error if not success', () => {
      fetchMock.mockReturnValueOnce(responseFactory(400));
      expect(() => api.request('path', { event: 'event', on: 'user["name"]' })).toThrow();
    });
  });

});