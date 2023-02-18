const mixpanel = require('../src/mixpanel.gs.js');

const fetchMock = jest.fn();
const PROJECT_ID = '12345';
const DEFAULT_DATA = {'data': 'data'};

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