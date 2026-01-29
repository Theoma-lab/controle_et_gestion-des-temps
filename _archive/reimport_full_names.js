const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";
const FILE_PATH = 'PENNYLANE_THEOMA_Timesheets.xlsx';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanString(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9-]/g, ""); // Keep only alphanumeric and hyphens
}

function generateEmail(fullName) {
    if (!fullName) return null;
    const parts = fullName.trim().split(/\s+/); // Split by spaces
    if (parts.length === 0) return null;

    const first = cleanString(parts[0]);
    let last = "";

    if (parts.length > 1) {
        // Robust First.Last join
        const rest = parts.slice(1).map(p => cleanString(p)).join('-');
        if (rest.length > 0) {
            last = "." + rest;
        }
    }

    return `${first}${last}@theoma.fr`;
}

function excelDateToJSDate(serial) {
    if (!serial) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString();
}

async function main() {
    console.log("🚀 Démarrage de l'import DEBUG (No Delete, Log Sample)...");

    const excelPath = path.join(__dirname, FILE_PATH);
    if (!fs.existsSync(excelPath)) {
        console.error("❌ Fichier Excel introuvable !");
        process.exit(1);
    }
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`📂 ${rows.length} lignes lues.`);

    // 2. EXTRACT EMPLOYEES
    const employeeMap = new Map();
    rows.forEach(row => {
        const rawName = row['Collaborateur'];
        if (rawName) {
            const email = generateEmail(rawName);
            if (email) employeeMap.set(email, rawName.trim());
        }
    });

    console.log(`👥 ${employeeMap.size} collaborateurs uniques.`);

    // 3. UPSERT EMPLOYEES
    const employeesPayload = Array.from(employeeMap.entries()).map(([email, name]) => ({
        email: email,
        name: name,
        role: 'user'
    }));

    const { error: empError } = await supabase
        .from('employees')
        .upsert(employeesPayload, { onConflict: 'email' });

    if (empError) {
        console.error("❌ Erreur employes:", empError);
        process.exit(1);
    }
    console.log("✅ Employés upserted.");

    // 4. SKIP DELETE FOR DEBUG
    console.log("⚠️ SKIPPING DELETE STEP to isolate error.");

    // 5. PREPARE PAYLOAD
    const payload = rows.map(row => {
        const rawName = row['Collaborateur'];
        if (!rawName) return null;
        const email = generateEmail(rawName);

        let dateVal = null;
        if (row['Date']) {
            if (typeof row['Date'] === 'number') dateVal = excelDateToJSDate(row['Date']);
            else {
                const d = new Date(row['Date']);
                if (!isNaN(d.getTime())) dateVal = d.toISOString();
            }
        }

        let billable = false;
        const rawBill = row['Facturable'];
        if (rawBill === true || String(rawBill).toLowerCase() === 'true' || String(rawBill).toLowerCase() === 'oui') {
            billable = true;
        }

        let hours = 0;
        if (row['Temps (h)'] !== undefined) hours = parseFloat(row['Temps (h)']);
        else if (row['Durée'] !== undefined) hours = parseFloat(row['Durée']);

        const durationMins = Math.round(hours * 60);

        return {
            date: dateVal,
            employee_email: email,
            client: row['Client'] || null,
            year: row['Millésime'] ? parseInt(row['Millésime']) : null,
            comment: row['Note'] || row['Commentaire'] || null,
            code: row['Code'] ? String(row['Code']) : null,
            mission_type: row['Type de Mission'] || null,
            activity: row['Activité'] || null,
            duration: durationMins,
            billable: billable,
            product: row['Produit'] || null,
            quantity: row['Quantité'] || 0,
            billing_status: row['Statut de facturation'] || row['Etat'] || null
        };
    }).filter(p => p && p.date && p.employee_email);

    console.log(`📦 ${payload.length} rows to insert.`);

    if (payload.length > 0) {
        console.log("SAMPLE ROW [0]:", JSON.stringify(payload[0], null, 2));
    }

    // 6. INSERT
    const BATCH_SIZE = 100;
    for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const batch = payload.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('timesheets').insert(batch);

        if (error) {
            console.error(`❌ Erreur Insert Lot ${i}:`, error);
            // Break to see first error
            break;
        } else {
            console.log(`Iter ${i + batch.length} ok`);
        }
    }
}

main();
