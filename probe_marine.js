const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function probe() {
    console.log("🕵️ Probing specific emails...");

    const targets = ['alexia@theoma.fr', 'marine@theoma.fr'];

    for (const email of targets) {
        console.log(`\nTesting: [${email}]`);
        const { data, error } = await supabase.from('timesheets').insert({
            employee_email: email,
            duration: 0,
            comment: '__PROBE_DEBUG__',
            date: new Date().toISOString()
        }).select();

        if (error) {
            console.error(`❌ FAILURE for ${email}:`);
            console.error(JSON.stringify(error, null, 2));
        } else {
            console.log(`✅ SUCCESS for ${email}`);
            // Cleanup
            await supabase.from('timesheets').delete().eq('id', data[0].id);
        }
    }
}

probe();
