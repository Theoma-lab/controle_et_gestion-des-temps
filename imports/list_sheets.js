const XLSX = require('xlsx');

const file = 'THEOMA - Liste clients.xlsx';
console.log(`\n=== Analyzing: ${file} ===`);
try {
    const workbook = XLSX.readFile(file);
    console.log('Sheets found:', workbook.SheetNames.join(', '));
} catch (err) {
    console.error(`Error reading ${file}:`, err.message);
}
