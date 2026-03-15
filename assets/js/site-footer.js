(function () {

  function initFooter() {
    const footer = document.querySelector("[data-footer]");
    if (!footer) return;

    const form = footer.querySelector("#newsletterForm");
    const emailInput = footer.querySelector("#newsletterEmail");
    const msg = footer.querySelector("#newsletterMsg");

    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = emailInput.value.trim();

      if (!/\S+@\S+\.\S+/.test(email)) {
        showMessage("Ingresa un correo válido.", true);
        return;
      }

      // Aquí puedes conectar tu API real
      console.log("Suscripción:", email);

      showMessage("¡Gracias por suscribirte!", false);
      form.reset();
    });

    function showMessage(text, isError) {
      msg.textContent = text;
      msg.style.display = "block";
      msg.style.color = isError ? "#f87171" : "#34d399";
      setTimeout(() => msg.style.display = "none", 4000);
    }
  }

  document.addEventListener("DOMContentLoaded", initFooter);

})();
