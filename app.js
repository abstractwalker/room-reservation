const buttons = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".section-content");
const form = document.querySelector("#reservation-form");
const message = document.querySelector("#message");

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
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "Reservation form submitted. Database access will be added later.";
  message.classList.remove("d-none");
  form.reset();
});
