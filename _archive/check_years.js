const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    // Get Min Date
    const { data: minData, error: minErr } = await supabase
        .from('timesheets')
        .select('date')
        .order('date', { ascending: true })
        .limit(1);

    // Get Max Date
    const { data: maxData, error: maxErr } = await supabase
        .from('timesheets')
        .select('date')
        .order('date', { ascending: false })
        .limit(1);

    // Fetch ALL years (Millésime)
    const { data: allRows, error: allErr } = await supabase
        .from('timesheets')
        .select('year')
        .limit(50000);

    if (allErr) {
        console.error("Error:", allErr);
        return;
    }

    const millesimes = new Set();
    allRows.forEach(r => {
        if (r.year) millesimes.add(r.year);
    });

    console.log("Millésimes found in DB:", Array.from(millesimes).sort());
    if (minData && minData[0]) console.log("Oldest Date:", minData[0].date);
    if (maxData && maxData[0]) console.log("Newest Date:", maxData[0].date);
    console.log("Total Records:", allRows.length);
}

check();
