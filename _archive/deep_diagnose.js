const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    // 1. Check DB
    const { data } = await supabase.from('timesheets').select('employee_email').ilike('employee_email', '%sanadati%').limit(1);
    if (!data || !data.length) {
        console.log("DB: No Sanadati found.");
    } else {
        const email = data[0].employee_email;
        console.log(`DB Email: '${email}'`);
        console.log(`DB Length: ${email.length}`);
        console.log("DB Chars:", email.split('').map(c => c.charCodeAt(0)));
    }

    // 2. Check Map
    try {
        const map = JSON.parse(fs.readFileSync('employee_map.json', 'utf8'));
        const key = Object.keys(map).find(k => k.includes('sanadati'));
        if (key) {
            console.log(`Map Key: '${key}'`);
            console.log(`Map Length: ${key.length}`);
            console.log("Map Chars:", key.split('').map(c => c.charCodeAt(0)));
        } else {
            console.log("Map: No Sanadati key found.");
        }
    } catch (e) { console.error("Map read error", e); }
}

check();
