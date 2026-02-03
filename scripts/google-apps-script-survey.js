/**
 * Google Apps Script for GTM Tenure Survey
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Copy this entire code into Code.gs
 * 3. Update SPREADSHEET_ID with your Google Sheet ID
 * 4. Click Deploy > New deployment
 * 5. Select "Web app" as the type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click Deploy and copy the URL
 * 9. Add the URL to your .env file as PUBLIC_SURVEY_SCRIPT_URL
 */

// Replace with your Google Sheet ID (from the URL)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Survey Responses';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      // Create sheet if it doesn't exist
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      spreadsheet.insertSheet(SHEET_NAME);
      const newSheet = spreadsheet.getSheetByName(SHEET_NAME);

      // Add headers
      const headers = [
        'Timestamp',
        'Path',
        // GTM Leader fields
        'Function',
        'Title',
        'Title Other',
        'Stage Start',
        'Stage End',
        'Tenure (months)',
        'Outcome',
        'Stated Reason',
        'Real Reason',
        'Tooling Maturity',
        'Measurement',
        'Levers',
        'Built/Inherited',
        'System Change',
        'Wish Board',
        // Founder fields
        'Current Stage',
        'Company Size',
        'GTM Count',
        'What Changed',
        'Measured Against',
        'Right Metrics',
        'Founder Wish',
        'Founder Hindsight',
        // Contact
        'Email',
        'Name',
        'LinkedIn'
      ];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

      return appendToSheet(newSheet, e);
    }

    return appendToSheet(sheet, e);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendToSheet(sheet, e) {
  let data;

  try {
    data = JSON.parse(e.postData.contents);
  } catch (parseError) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const row = [
    data.timestamp || new Date().toISOString(),
    data.path || '',
    // GTM Leader fields
    data.function || '',
    data.title || '',
    data.titleOther || '',
    data.stageStart || '',
    data.stageEnd || '',
    data.tenure || '',
    data.outcome || '',
    data.statedReason || '',
    data.realReason || '',
    data.tooling || '',
    data.measurement || '',
    data.levers || '',
    data.builtInherited || '',
    data.systemChange || '',
    data.wishBoard || '',
    // Founder fields
    data.currentStage || '',
    data.companySize || '',
    data.gtmCount || '',
    data.whatChanged || '',
    data.measuredAgainst || '',
    data.rightMetrics || '',
    data.founderWish || '',
    data.founderHindsight || '',
    // Contact
    data.email || '',
    data.name || '',
    data.linkedin || ''
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'GTM Survey API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function - run this to verify setup
function testSetup() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet) {
      Logger.log('Sheet found! Setup is correct.');
    } else {
      Logger.log('Sheet not found. It will be created on first submission.');
    }
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    Logger.log('Make sure SPREADSHEET_ID is set correctly.');
  }
}
