# Mixpanel for Google Apps Script
This is a library for Google Apps Script that allows you 
to easily load reports from Mixpanel into Google Sheets or other
apps.

![Tests status](https://github.com/harabchuk/gs-mixpanel/actions/workflows/tests.yml/badge.svg?event=push)


### Usage
1. Copy src/mixpanel.gs.js into your Google Apps Script project
2. Create a new service account for your project in Mixpanel
3. Create and assign constants in your script:
   - SERVICE_ACCOUNT_USER
   - SERVICE_ACCOUNT_KEY
   - MIXPANEL_PROJECT_ID

```javascript
   const SERVICE_ACCOUNT_USER = '...'; 
   const SERVICE_ACCOUNT_KEY = '...';
   const MIXPANEL_PROJECT_ID = '...';
   
   const api = new MixpanelApi(SERVICE_ACCOUNT_USER, SERVICE_ACCOUNT_KEY, MIXPANEL_PROJECT_ID);
   
   // Get a segmentation report
   const data = api.segmentationReport({ 
      event: 'Login', 
      on: 'user["name"]', 
      from_date: '2023-01-01', 
      to_date: '2023-01-31' 
   });

  // Insert data into Google Sheets
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const range = sheet.getRange(1, 1, data.length, data[0].length);
  range.setValues(data);
```

### More examples

* [Segmentation report to spreadsheet](src/examples/segmentation-to-spreadsheet.gs.js)

### License
MIT