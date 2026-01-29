const XLSX = require('xlsx');

const file = 'THEOMA - Liste clients.xlsx';
const sheetName = 'Clients';

console.log(`\n=== Inspecting Sheet: ${sheetName} ===`);
try {
    const workbook = XLSX.readFile(file);
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        console.error(`Sheet "${sheetName}" not found!`);
        process.exit(1);
    }

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

    // Preview data
    const data = XLSX.utils.sheet_to_json(worksheet, { limit: 5 });
    console.log('Data Preview:', JSON.stringify(data, null, 2));

} catch (err) {
    console.error(`Error reading ${file}:`, err.message);
}
