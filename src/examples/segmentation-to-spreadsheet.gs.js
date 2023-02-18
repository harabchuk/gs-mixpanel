const SERVICE_ACCOUNT_USER='yyyy';
const SERVICE_ACCOUNT_KEY = 'xxxxx';
const PROJECT_ID = '12345';

/**
 * An example of requesting a segmentation report from Mixpanel
 * and inserting it into an active sheet.
 */
function insertReport() {
  // Get Mixpanel data
  const api = new MixpanelApi(SERVICE_ACCOUNT_USER, SERVICE_ACCOUNT_KEY, PROJECT_ID);
  const data = api.segmentationReport({
    event: 'Login',
    on: 'user["name"]',
    from_date: '2023-01-10',
    to_date: '2023-01-30',
    unit: api.BreakdownUnit.DAY,
  },
  {
    sumBuckets: true }
  );
  console.log(data);

  // Insert data into Google Sheets
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const range = sheet.getRange(1, 1, data.length, data[0].length);
  range.setValues(data);
}