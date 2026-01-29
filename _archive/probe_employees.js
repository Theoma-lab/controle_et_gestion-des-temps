const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";
const FILE_PATH = 'PENNYLANE_THEOMA_Timesheets.xlsx';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function formatEmail(name) {
    if (!name) return null;
    const firstName = name.split(' ')[0].toLowerCase().trim();
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

async function main() {
    // 1. Get Emails from Excel
    const excelPath = path.join(__dirname, FILE_PATH);
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const candidates = new Set();
    const nameMap = {};
    rows.forEach(r => {
        const raw = r['Collaborateur'];
        if (raw) {
            const email = formatEmail(raw);
            candidates.add(email);
            nameMap[email] = raw.trim(); // Store full name
        }
    });

    console.log(`Testing ${candidates.size} unique emails...`);
    const valid = [];
    const invalid = [];

    // 2. Probe
    for (const email of candidates) {
        // Try insert dummy
        const { error } = await supabase.from('timesheets').insert([{
            date: new Date().toISOString(),
            employee_email: email,
            billable: false,
            duration: 0,
            comment: '__PROBE__'
        }]);

        if (error && error.code === '23503') {
            invalid.push(email);
            process.stdout.write('x');
        } else if (error) {
            // Other error? (e.g. RLS on timesheets?)
            console.error(`Error on ${email}:`, error.code);
            invalid.push(email);
        } else {
            valid.push(email);
            process.stdout.write('.');
            // Clean up
            await supabase.from('timesheets').delete().eq('comment', '__PROBE__').eq('employee_email', email);
        }
    }

    fs.writeFileSync('valid_list.json', JSON.stringify(valid, null, 2));
    fs.writeFileSync('missing_list.json', JSON.stringify(invalid, null, 2));
    fs.writeFileSync('name_map.json', JSON.stringify(nameMap, null, 2));

    console.log("Results saved to valid_list.json, missing_list.json, name_map.json");
}

main();
