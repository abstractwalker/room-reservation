const SUPABASE_URL = "https://xzpuburlepucdcynzrdr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_oxX4O9T7bFJnilBoO53vIA_zjqRYubI";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const buttons = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".section-content");
const message = document.querySelector("#message");
const reservationsList = document.querySelector("#reservations-list");

async function loadReservations() {
  message.textContent = "Loading reservations...";
  message.className = "alert alert-info mt-3";

  const { data, error } = await supabaseClient
    .from("reservations")
    .select("date_from, date_to, room:rooms(name), client:clients(name)");

  if (error) {
    message.textContent = `Could not load reservations: ${error.message}`;
    message.className = "alert alert-danger mt-3";
    return;
  }

  reservationsList.innerHTML = data.map((reservation) => `
    <tr>
      <td>${reservation.room?.name || "-"}</td>
      <td>${reservation.client?.name || "-"}</td>
      <td>${reservation.date_from || "-"}</td>
      <td>${reservation.date_to || "-"}</td>
    </tr>
  `).join("");
  message.className = "d-none";
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const sectionId = button.dataset.section;

    sections.forEach((section) => {
      section.classList.toggle("d-none", section.id !== sectionId);
    });

    buttons.forEach((item) => {
      item.classList.toggle("btn-primary", item === button);
      item.classList.toggle("btn-outline-primary", item !== button);
    });

    if (sectionId === "reservations") {
      loadReservations();
    }
  });
});

loadReservations();
