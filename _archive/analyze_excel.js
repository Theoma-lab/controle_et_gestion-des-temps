const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');
const outputPath = path.join(__dirname, 'headers.json');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get headers (first row)
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const headers = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: range.s.r };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (sheet[cell_ref]) headers.push(sheet[cell_ref].v);
    }

    // Get first row of data
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const result = {
        headers: headers,
        firstRow: data.length > 1 ? data[1] : null,
        sampleData: data.slice(1, 4) // First 3 rows
    };

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    console.log('Analysis written to headers.json');

} catch (err) {
    console.error('Error reading file:', err);
    fs.writeFileSync(outputPath, JSON.stringify({ error: err.message }), 'utf8');
}
