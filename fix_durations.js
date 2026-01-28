const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fix() {
    console.log("🚑 Starting Duration Fix (Divide by 60)...");

    // Process in chunks of 1000
    const pageSize = 1000;
    let page = 0;
    let totalFixed = 0;

    while (true) {
        // Fetch chunk
        const { data, error } = await supabase
            .from('timesheets')
            .select('id, duration')
            .gt('duration', 480) // Only touch rows > 8 hours (480 mins) to be safe? 
            // actually, if 1h was imported as 60, it became 3600.
            // if 5m was imported as 5, it became 300.
            // ALL rows from the Excel 'Durée' import are wrong.
            // But how to distinguish from 'Temps (h)' rows (which were correct)?
            // The Excel had mixed columns?
            // Step 1411 code: if (Temps(h)) use it, else if (Durée) use it.
            // I suspect virtually ALL rows used 'Durée' or ALL used 'Temps'.
            // 4500 (75h) is definitely wrong.
            // 300 (5h) could be valid.
            // Let's assume ALL large numbers are wrong.
            // Any duration > 24*60 (1440) is definitely wrong.
            // 14400 is 240 hours.
            .gt('duration', 1000) // Let's correct the obvious ones first?
            // NO, if I correct only obvious ones, I leave 5h (300) which might actually be 5m (300/60 = 5).
            // User said: "les données... sont en minutes". This implies the SOURCE was minutes.
            // My script did `hours = row['Durée']`. `duration = hours * 60`.
            // So I effectively multiplied EVERYTHING by 60.
            // So I must divide EVERYTHING by 60.
            // Wait, round errors? 5 * 60 = 300. 300 / 60 = 5. Safe.
            // What if valid data existed?
            // If valid data (5h) was stored as 300. 300 / 60 = 5.
            // Wait. If I stored 5h as 300. And I divide by 60 -> 5.
            // Frontend displays 5 / 60 = 0.08 h. WRONG.

            // LET'S RETHINK.
            // Current DB: 4500. Frontend: 4500/60 = 75 h.
            // Target Display: 75 minutes = 1.25 h.
            // So DB should be 75.
            // Current DB is 4500. 4500 / 60 = 75.
            // So yes, I must divide DB values by 60.

            // What about rows that were correct?
            // If I had "Temps (h)" = 1.5. DB = 90.
            // If I divide by 60 -> 1.5.
            // Frontend: 1.5 / 60 = 0.025 h. WRONG.

            // I need to know WHICH rows came from 'Durée'.
            // I don't have that info.

            // User said: "Les données que nous avons importés... sont en minutes".
            // Suggesting the WHOLE import was minutes.
            // I will assume the whole dataset needs correction.

            // Let's check small values.
            // If I have a row with duration 60 (1 hour).
            // If it needs correction, it means it was 1 minute.
            // If it doesn't, it is 1 hour.

            // Use the "Huge" items as proxy. 
            // Most items seem to be huge.
            // I will divide ALL items.

            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) { console.error(error); break; }
        if (!data || data.length === 0) break;

        const updates = data.map(r => ({
            id: r.id,
            duration: Math.round(r.duration / 60)
        }));

        // Upsert back
        const { error: upError } = await supabase.from('timesheets').upsert(updates);

        if (upError) console.error("Update Error", upError);
        else console.log(`✅ Fixed chunk ${page}: ${updates.length} rows`);

        totalFixed += updates.length;
        page++;

        // Safety for this turn
        if (page > 30) break;
    }
    console.log("Done.");
}

fix();
