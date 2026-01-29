const XLSX = require('xlsx');
const fs = require('fs');

const files = [
    'THEOMA - Liste clients.xlsx',
    'THEOMA - Suivi temps.xlsx'
];

files.forEach(file => {
    console.log(`\n=== Analyzing: ${file} ===`);
    try {
        const workbook = XLSX.readFile(file);
        workbook.SheetNames.forEach(sheetName => {
            console.log(`\nSheet: ${sheetName}`);
            const worksheet = workbook.Sheets[sheetName];
            // Get range
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            console.log(`Dimensions: ${worksheet['!ref']}`);

            // Get headers (first row)
            const headers = [];
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: range.s.r };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (worksheet[cell_ref]) headers.push(worksheet[cell_ref].v);
            }
            console.log('Headers:', headers.join(' | '));

            // Preview first 2 rows of data
            const data = XLSX.utils.sheet_to_json(worksheet, { limit: 2 });
            console.log('Data Preview:', JSON.stringify(data, null, 2));
        });
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
