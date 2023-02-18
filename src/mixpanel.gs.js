/**
 * Mixpanel API wrapper for Google Apps Script
 *
 * Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Copy this file into the project
 * 3. Create a new service account for your project in Mixpanel
 * 4. Create constants in your script:
 *  - SERVICE_ACCOUNT_USER
 *  - SERVICE_ACCOUNT_KEY
 *  - MIXPANEL_PROJECT_ID
 *
 * Example:
 *  const SERVICE_ACCOUNT_USER = '...';
 *  const SERVICE_ACCOUNT_KEY = '...';
 *  const MIXPANEL_PROJECT_ID = '...';
 *  const api = new MixpanelApi(SERVICE_ACCOUNT_USER, SERVICE_ACCOUNT_KEY, MIXPANEL_PROJECT_ID);
 *  const data = api.segmentationReport({ event: 'Login', on: 'user["name"], from_date: '2023-01-01', to_date: '2023-01-31' });
 */
class MixpanelApi {
  constructor(serviceAccountUser, serviceAccountKey, projectId) {
    this.projectId = projectId;
    this.serviceAccountUser = serviceAccountUser;
    this.serviceAccountKey = serviceAccountKey;
    this.baseUrl = 'https://mixpanel.com/api/2.0/';
  }

  /**
   * Calls the Mixpanel API to get the segmentation report
   * @param segmentationOptions {Object} - Segmentation options
   *  - event {String} - Mixpanel Event name
   *  - on {String} - Property to segment on (e.g. user["name"], properties["amount"])
   *  - from_date {String} - Start date (e.g. 2023-01-01)
   *  - to_date {String} - End date (e.g. 2023-01-31)
   * @param outputOptions {Object} - Output options
   *  - dateColumn {String} - Date column name
   *  - keyColumn {String} - Key column name
   *  - valueColumn {String} - Value column name
   *  - sumBuckets {Boolean} - If true all date buckets will be summed up
   * @returns {Array} - Array of arrays with the data
   */
  segmentationReport(
    segmentationOptions = { event:null, on:null },
    outputOptions = { dateColumn: 'Date', keyColumn:'Key', valueColumn:'Value', sumBuckets: false }
  ) {
    const data = this.request('segmentation', segmentationOptions);
    return this.flattenSegmentationData(data, outputOptions);
  }

  flattenSegmentationData(response, options={ dateColumn: 'Date', keyColumn:'Key', valueColumn:'Value', sumBuckets: false } ) {
    const flatData = [];

    // Headers
    if (options.sumBuckets) {
      flatData.push([
        options.keyColumn || 'Key',
        options.valueColumn || 'Value'
      ]);
    } else {
      flatData.push([
        options.dateColumn || 'Date',
        options.keyColumn || 'Key',
        options.valueColumn || 'Value'
      ]);
    }

    const series = response.data.series;
    const values = response.data.values;

    const add = (a, b) => a + b;
    const sum = (arr) => arr.reduce(add, 0);

    // Values
    for(let group of Object.entries(values)) {
      const key = group[0];

      if (options.sumBuckets) {
        const bucketValues = [];
        for(let serie of series) {
          bucketValues.push(group[1][serie]);
        }
        flatData.push([key, sum(bucketValues)]);
      } else {
        for(let serie of series) {
          flatData.push([serie, key, group[1][serie]]);
        }
      }
    }

    return flatData;
  }

  buildUrl(url, queryParams) {
    const queryString = Object
      .entries(queryParams)
      .flatMap(([k, v]) => Array.isArray(v) ? v.map(e => `${k}=${encodeURIComponent(e)}`) : `${k}=${encodeURIComponent(v)}`)
      .join("&");
    return url + "?" + queryString;
  }

  request(path, queryParams={}) {
    const url = this.buildUrl(`${this.baseUrl}${path}`, {
      ...queryParams,
      project_id: this.projectId,
    });
    const options = {
      muteHttpExceptions: true,
      headers: {
        authorization: `Basic ${this.serviceAccountUser}:${this.serviceAccountKey}`,
      }
    };
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    if (response.getResponseCode() > 201) {
      throw Error(`Error ${data["error"]} Status code ${response.getResponseCode()}`);
    }
    return data;
  }
}

/**
 * The next code is used for testing purposes only.
 * You don't need to copy it to your Google Apps script.
 */
if (typeof exports !== 'undefined') {
  module.exports = { MixpanelApi };
}