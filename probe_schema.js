const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function probe() {
    const email = `probe.${Date.now()}@test.fr`;

    console.log("Probing {email, name}...");
    const { error: err1 } = await supabase.from('employees').upsert([{ email, name: 'Test' }]);
    if (!err1) { console.log("SUCCESS: name column exists."); return; }
    console.log("Fail:", err1.code);

    console.log("Probing {email, full_name}...");
    const { error: err2 } = await supabase.from('employees').upsert([{ email, full_name: 'Test' }]);
    if (!err2) { console.log("SUCCESS: full_name column exists."); return; }
    console.log("Fail:", err2.code);

    console.log("Probing {email} only...");
    const { error: err3 } = await supabase.from('employees').upsert([{ email }]);
    if (!err3) { console.log("SUCCESS: email only works (name cols optional/missing)."); return; }
    console.log("Fail:", err3.code);
}

probe();
