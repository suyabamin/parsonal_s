// Google Apps Script Backend for Omni-Vault Dashboard
// This script handles all Google Sheets and Drive operations

// Main handler for doPost requests
function doPost(e) {
  var jsonString = e.postData.contents;
  var params = JSON.parse(jsonString);
  
  var action = params.action;
  var sheetType = params.sheetType;
  var data = params.data;
  var fileId = params.fileId;
  var fileData = params.fileData;
  var fileName = params.fileName;
  var fileType = params.fileType;
  
  var result = {};
  
  try {
    if (action === 'saveToSheet') {
      result = saveToSheet(data, sheetType);
    } else if (action === 'readFromSheet') {
      result = readFromSheet(sheetType);
    } else if (action === 'saveToDrive') {
      result = saveToDrive(fileData, fileName, fileType);
    } else if (action === 'readFromDrive') {
      result = readFromDrive(fileId);
    } else if (action === 'testConnection') {
      result = {
        success: true,
        message: 'Connection successful! Google Apps Script is working.',
        timestamp: new Date().toISOString()
      };
    } else {
      result.success = false;
      result.error = 'Unknown action: ' + action;
    }
  } catch (error) {
    result.success = false;
    result.error = error.toString();
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Save data to Google Sheet
function saveToSheet(data, sheetType) {
  try {
    // Get or create the spreadsheet
    var ss = getOrCreateSpreadsheet(sheetType);
    var sheet = ss.getActiveSheet();
    
    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      if (sheetType === 'notes') {
        sheet.appendRow(['ID', 'Content', 'Preview', 'Timestamp']);
      } else if (sheetType === 'links') {
        sheet.appendRow(['ID', 'Name', 'URL', 'Timestamp']);
      } else {
        sheet.appendRow(['ID', 'Name', 'Data', 'Timestamp']);
      }
    }
    
    // Append the data
    if (sheetType === 'notes') {
      sheet.appendRow([data.id, data.content, data.preview, data.timestamp]);
    } else if (sheetType === 'links') {
      sheet.appendRow([data.id, data.name, data.url, data.timestamp]);
    } else {
      sheet.appendRow([data.id, data.name, JSON.stringify(data), data.timestamp]);
    }
    
    return {
      success: true,
      message: 'Data saved successfully to ' + sheetType + ' sheet'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Read data from Google Sheet
function readFromSheet(sheetType) {
  try {
    var ss = SpreadsheetApp.openById(PropertiesService.getUserProperties().getProperty(sheetType + '_SPREADSHEET_ID'));
    if (!ss) {
      return {
        success: false,
        error: 'Spreadsheet not found for ' + sheetType
      };
    }
    
    var sheet = ss.getSheetByName(sheetType.charAt(0).toUpperCase() + sheetType.slice(1));
    if (!sheet) {
      return {
        success: false,
        error: 'Sheet not found: ' + sheetType
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data.shift(); // Remove header row
    
    var result = [];
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      if (row && row.length > 0) {
        var item = {};
        for (var j = 0; j < headers.length; j++) {
          item[headers[j]] = row[j];
        }
        
        // Format the item based on sheet type
        if (sheetType === 'notes') {
          result.push({
            id: parseInt(item['ID']),
            content: item['Content'],
            preview: item['Preview'],
            timestamp: item['Timestamp']
          });
        } else if (sheetType === 'links') {
          result.push({
            id: parseInt(item['ID']),
            name: item['Name'],
            url: item['URL'],
            timestamp: item['Timestamp']
          });
        } else {
          result.push(item);
        }
      }
    }
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Save file to Google Drive
function saveToDrive(fileData, fileName, fileType) {
  try {
    // Extract the base64 data from the data URL
    var base64Data = fileData.split(',')[1];
    var contentType = getContentType(fileType);
    
    // Decode base64 data to binary
    var byteCharacters = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(byteCharacters, contentType, fileName);
    
    // Get or create the folder for this app
    var folder = getOrCreateAppFolder();
    
    // Upload the file to the folder
    var file = folder.createFile(blob);
    
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      message: 'File saved successfully to Drive'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Read file from Google Drive
function readFromDrive(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    
    return {
      success: true,
      fileName: file.getName(),
      mimeType: file.getMimeType(),
      downloadUrl: file.getUrl(),
      size: file.getSize()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Helper function to get or create the main spreadsheet
function getOrCreateSpreadsheet(sheetType) {
  var spreadsheetId = PropertiesService.getUserProperties().getProperty(sheetType + '_SPREADSHEET_ID');
  var ss;
  
  if (spreadsheetId) {
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      // Spreadsheet doesn't exist anymore, create a new one
      spreadsheetId = null;
    }
  }
  
  if (!spreadsheetId) {
    var ssName = 'Omni-Vault-' + sheetType.charAt(0).toUpperCase() + sheetType.slice(1);
    ss = SpreadsheetApp.create(ssName);
    spreadsheetId = ss.getId();
    PropertiesService.getUserProperties().setProperty(sheetType + '_SPREADSHEET_ID', spreadsheetId);
    
    // Rename the default sheet
    ss.getActiveSheet().setName(sheetType.charAt(0).toUpperCase() + sheetType.slice(1));
  }
  
  return ss;
}

// Helper function to get or create the app folder in Drive
function getOrCreateAppFolder() {
  var folderId = PropertiesService.getUserProperties().getProperty('APP_FOLDER_ID');
  var folder;
  
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      // Folder doesn't exist anymore, create a new one
      folderId = null;
    }
  }
  
  if (!folderId) {
    var folderName = 'Omni-Vault-Files';
    folder = DriveApp.createFolder(folderName);
    folderId = folder.getId();
    PropertiesService.getUserProperties().setProperty('APP_FOLDER_ID', folderId);
  }
  
  return folder;
}

// Helper function to get content type based on file type
function getContentType(fileType) {
  switch(fileType) {
    case 'pdf':
      return 'application/pdf';
    case 'image':
      return 'image/jpeg'; // Could be expanded to detect actual image type
    case 'video':
      return 'video/mp4'; // Could be expanded to detect actual video type
    default:
      return 'application/octet-stream';
  }
}

// doGet function for testing purposes
function doGet() {
  return HtmlService.createHtmlOutput('<h1>Omni-Vault Backend Service is Running</h1>');
}