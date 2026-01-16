// ===== CONFIG =====
const SUPABASE_URL = "https://eufyjhghzsjcobcmhlfa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RqFecRbooAkyilPvdFmrdg_IbbYcIPr";
const SOURCE = "llumina-waitlist-2026";
// ==================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("email-input");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    const email = emailInput.value.trim().toLowerCase();

    submitBtn.disabled = true;
    submitBtn.textContent = "Joining...";

    try {
        const { error } = await db.from("waitlist").insert({
            email: email,
            source: SOURCE
        });

        if (!error) {
            // FIX: Use absolute path for Netlify redirect
            window.location.href = "/lumina/thank-you/";
            return;
        }

        if (error.code === "23505") {
            statusEl.textContent = "You're already on the list.";
        } else {
            statusEl.textContent = "Error: " + error.message;
        }

    } catch (err) {
        statusEl.textContent = "Network error. Try again.";
    } finally {
        if (statusEl.textContent !== "") {
            submitBtn.disabled = false;
            submitBtn.textContent = "Join Waitlist";
        }
    }
});
