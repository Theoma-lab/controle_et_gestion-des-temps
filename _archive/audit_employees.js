const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("🔍 Auditing Employees in DB...");

    // 1. Get Total Count
    const { count, error: countErr } = await supabase
        .from('timesheets')
        .select('*', { count: 'exact', head: true });

    if (countErr) {
        console.error("Count Error:", countErr);
        return;
    }
    console.log(`\n📊 Total Rows in DB: ${count}`);

    // 2. Get Unique Emails
    // Note: .select distinct is not directly supported nicely in one go without RPC usually, 
    // but with 25k record fetch (if it works) we can do it locally, or use a specific column fetch.
    // We already know limit 25k is possible.    
    const { data, error } = await supabase
        .from('timesheets')
        .select('employee_email')
        .limit(50000); // Massive limit to catch all

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    const emails = new Set();
    data.forEach(r => {
        if (r.employee_email) emails.add(r.employee_email);
    });

    console.log(`\n👥 Unique Employees Found: ${emails.size}`);
    const sortedEmails = Array.from(emails).sort();

    fs.writeFileSync('audit_report.json', JSON.stringify(sortedEmails, null, 2));
    console.log("Report saved to audit_report.json");
}

check();
