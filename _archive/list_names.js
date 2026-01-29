const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');
const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

const uniqueNames = new Set();
rows.forEach(r => {
    if (r['Collaborateur']) uniqueNames.add(r['Collaborateur']);
});

console.log("Unique Names in Excel:");
Array.from(uniqueNames).sort().forEach(n => console.log(n));
