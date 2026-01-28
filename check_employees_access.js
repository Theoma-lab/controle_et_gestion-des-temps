const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("🕵️ Checking `employees` table access...");

    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(50);

    if (error) {
        console.error("❌ Access Denied / Error:", error.message);
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log(`✅ Access Granted. Found ${data.length} employees.`);
        console.log(JSON.stringify(data.map(e => e.email), null, 2));
    }
}

check();
