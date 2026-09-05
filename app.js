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
const reservationForm = document.querySelector("#reservation-form");
const roomSelect = document.querySelector("#room");
const clientSelect = document.querySelector("#client");

function showMessage(text, type) {
  message.textContent = text;
  message.className = `alert alert-${type} mt-3`;
}

async function loadRooms() {
  const { data, error } = await supabaseClient
    .from("rooms")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Could not load rooms:", error);
    showMessage(`Could not load rooms: ${error.message}`, "danger");
    return;
  }

  roomSelect.innerHTML = '<option value="">Select a room</option>';
  data.forEach((room) => {
    roomSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${room.id}">${room.name}</option>`
    );
  });
}

async function loadClients() {
  const { data, error } = await supabaseClient
    .from("clients")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Could not load clients:", error);
    showMessage(`Could not load clients: ${error.message}`, "danger");
    return;
  }

  clientSelect.innerHTML = '<option value="">Select a client</option>';
  data.forEach((client) => {
    clientSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${client.id}">${client.name}</option>`
    );
  });
}

async function loadReservations() {
  showMessage("Loading reservations...", "info");

  const { data, error } = await supabaseClient
    .from("reservations")
    .select("date_from, date_to, room:rooms(name), client:clients(name)");

  if (error) {
    console.error("Could not load reservations:", error);
    showMessage(`Could not load reservations: ${error.message}`, "danger");
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

reservationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const roomId = roomSelect.value;
  const clientId = clientSelect.value;
  const dateFrom = document.querySelector("#date_from").value;
  const dateTo = document.querySelector("#date_to").value;

  if (!roomId || !clientId || !dateFrom || !dateTo) {
    showMessage("Please select a room and client and enter both dates.", "danger");
    return;
  }

  if (dateFrom >= dateTo) {
    showMessage("The From date must be before the To date.", "danger");
    return;
  }

  const { error } = await supabaseClient
    .from("reservations")
    .insert({
      room_id: roomId,
      client_id: clientId,
      date_from: dateFrom,
      date_to: dateTo
    });

  if (error) {
    console.error("Could not save reservation:", error);
    showMessage(`Could not save reservation: ${error.message}`, "danger");
    return;
  }

  reservationForm.reset();
  await loadReservations();
  showMessage("Reservation saved successfully.", "success");
});

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

loadRooms();
loadClients();
loadReservations();
