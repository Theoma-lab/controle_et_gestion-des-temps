const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TESTS = [
    { name: 'Marine CHAILLON', formats: ['marine@theoma.fr', 'marine.chaillon@theoma.fr', 'm.chaillon@theoma.fr'] },
    { name: 'Sandra EMERY', formats: ['sandra@theoma.fr', 'sandra.emery@theoma.fr'] }
];

async function probe() {
    console.log("🕵️ Probing Email Formats...");

    for (const p of TESTS) {
        console.log(`\nChecking ${p.name}...`);
        for (const email of p.formats) {
            const { error } = await supabase.from('timesheets').insert({
                employee_email: email,
                duration: 0,
                comment: '__PROBE_CHECK__',
                date: new Date().toISOString()
            });

            if (!error) {
                console.log(`✅ SUCCESS: ${email} exists in employees table!`);
                // cleanup
                await supabase.from('timesheets').delete().eq('employee_email', email).eq('comment', '__PROBE_CHECK__');
            } else {
                console.log(`❌ FAILED: ${email} (${error.code})`);
            }
        }
    }
}

probe();
