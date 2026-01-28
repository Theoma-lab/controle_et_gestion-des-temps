const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');
const workbook = xlsx.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

if (rows.length > 0) {
    console.log("Excel Headers:", Object.keys(rows[0]));
    console.log("Sample Row:", JSON.stringify(rows[0]));
} else {
    console.log("No rows found.");
}
