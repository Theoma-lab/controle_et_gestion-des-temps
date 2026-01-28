const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("Testing FK...");
    const payload = [{
        date: new Date().toISOString(),
        employee_email: "fake.doesnotexist@theoma.fr",
        billable: false,
        duration: 60
    }];

    const { data, error } = await supabase
        .from('timesheets')
        .insert(payload)
        .select();

    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success! No strong FK?");
        await supabase.from('timesheets').delete().eq('employee_email', 'fake.doesnotexist@theoma.fr');
    }
}

run();
