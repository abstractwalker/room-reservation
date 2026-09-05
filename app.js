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
const roomsList = document.querySelector("#rooms-list");
const reservationForm = document.querySelector("#reservation-form");
const roomSelect = document.querySelector("#room");
const clientSelect = document.querySelector("#client");
const newRoomButton = document.querySelector("#new-room-button");
const cancelRoomButton = document.querySelector("#cancel-room-button");
const roomForm = document.querySelector("#room-form");
const roomFormContainer = document.querySelector("#room-form-container");
const roomNameInput = document.querySelector("#room-name");
const roomDescriptionInput = document.querySelector("#room-description");
let editingRoomId = null;

function showMessage(text, type) {
  message.textContent = text;
  message.className = `alert alert-${type} mt-3`;
}

async function loadRooms() {
  const { data, error } = await supabaseClient
    .from("rooms")
    .select("id, name, description")
    .order("name");

  if (error) {
    console.error("Could not load rooms:", error);
    showMessage(`Could not load rooms: ${error.message}`, "danger");
    return;
  }

  roomSelect.innerHTML = '<option value="">Select a room</option>';
  roomsList.innerHTML = "";
  data.forEach((room) => {
    roomSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${room.id}">${room.name}</option>`
    );
    roomsList.insertAdjacentHTML(
      "beforeend",
      `<tr>
        <td>${room.name}</td>
        <td>${room.description || ""}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary edit-room-button" data-id="${room.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger delete-room-button" data-id="${room.id}">Delete</button>
        </td>
      </tr>`
    );
  });
}

function showRoomForm(room) {
  editingRoomId = room ? room.id : null;
  roomNameInput.value = room ? room.name : "";
  roomDescriptionInput.value = room ? room.description || "" : "";
  roomFormContainer.classList.remove("d-none");
  roomNameInput.focus();
}

function hideRoomForm() {
  editingRoomId = null;
  roomForm.reset();
  roomFormContainer.classList.add("d-none");
}

async function saveRoom(event) {
  event.preventDefault();

  const name = roomNameInput.value.trim();
  const description = roomDescriptionInput.value.trim();

  if (!name) {
    showMessage("Room name is required.", "danger");
    return;
  }

  const roomData = { name, description };
  const { error } = editingRoomId
    ? await supabaseClient.from("rooms").update(roomData).eq("id", editingRoomId)
    : await supabaseClient.from("rooms").insert(roomData);

  if (error) {
    console.error("Could not save room:", error);
    showMessage(`Could not save room: ${error.message}`, "danger");
    return;
  }

  const messageText = editingRoomId
    ? "Room updated successfully."
    : "Room created successfully.";
  hideRoomForm();
  await loadRooms();
  showMessage(messageText, "success");
}

async function deleteRoom(roomId) {
  if (!window.confirm("Delete this room?")) {
    return;
  }

  const { error } = await supabaseClient
    .from("rooms")
    .delete()
    .eq("id", roomId);

  if (error) {
    console.error("Could not delete room:", error);
    showMessage(`Could not delete room. It may be used by a reservation: ${error.message}`, "danger");
    return;
  }

  showMessage("Room deleted successfully.", "success");
  await loadRooms();
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

newRoomButton.addEventListener("click", () => showRoomForm());
cancelRoomButton.addEventListener("click", hideRoomForm);
roomForm.addEventListener("submit", saveRoom);

roomsList.addEventListener("click", (event) => {
  const roomId = event.target.dataset.id;
  if (!roomId) {
    return;
  }

  if (event.target.classList.contains("edit-room-button")) {
    const row = event.target.closest("tr");
    showRoomForm({
      id: roomId,
      name: row.children[0].textContent,
      description: row.children[1].textContent
    });
  }

  if (event.target.classList.contains("delete-room-button")) {
    deleteRoom(roomId);
  }
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

    if (sectionId === "rooms") {
      loadRooms();
    }
  });
});

loadRooms();
loadClients();
loadReservations();
