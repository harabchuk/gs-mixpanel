/**
 * Mixpanel API wrapper for Google Apps Script
 * Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Copy this file into the project
 * 3. Define the following constants:
 *   - MIXPANEL_TOKEN: Your Mixpanel project token
 *   - MIXPANEL_API_URL: The Mixpanel API URL
 *
 */
class MixpanelApi {
  constructor(serviceAccountUser, serviceAccountKey, projectId) {
    this.projectId = projectId;
    this.serviceAccountUser = serviceAccountUser;
    this.serviceAccountKey = serviceAccountKey;
    this.baseUrl = 'https://mixpanel.com/api/2.0/';
  }

  segmentationReport(segmentationOptions = { event:null, on:null }) {
    return this.request('segmentation', segmentationOptions);
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

class MixpanelOutputTransformer {
  constructor() {}

  transform(data) {
    return data;
  }
}

if (typeof exports !== 'undefined') {
  module.exports = { MixpanelApi };
}