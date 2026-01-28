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

    // Get Year Counts (approx check via sampling or if possible via RPC, but simpler to just get min/max here)
    // Actually, getting all years is better.
    // Let's just fetch all dates (lightweight column) and distinct them locally if not too huge.
    // 23k rows of dates is nothing.

    // Fetch ALL dates
    const { data: allDates, error: allErr } = await supabase
        .from('timesheets')
        .select('date');

    if (allErr) {
        console.error("Error:", allErr);
        return;
    }

    const years = new Set();
    allDates.forEach(r => {
        if (r.date) {
            years.add(r.date.substring(0, 4));
        }
    });

    console.log("Years found in DB:", Array.from(years).sort());
    if (minData && minData[0]) console.log("Oldest Date:", minData[0].date);
    if (maxData && maxData[0]) console.log("Newest Date:", maxData[0].date);
    console.log("Total Records:", allDates.length);
}

check();
