// /assets/js/site-sidebar.js
(function () {
  // Helper para escapar texto en HTML
  function escapeHtml(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Render helpers
  function renderMostRead(list) {
    return list.map((item, i) => `
      <li class="sideList__item">
        <span class="sideList__rank">${i+1}</span>
        <a class="sideList__link" href="${escapeHtml(item.url || '#')}">${escapeHtml(item.title)}</a>
      </li>
    `).join("");
  }

  function renderRecent(list) {
    return list.map(item => `
      <li class="recent-list__item">
        <span class="dot"></span>
        <div class="item-content">
          <a class="recent-list__link" href="${escapeHtml(item.url || '#')}">${escapeHtml(item.title)}</a>
          ${item.time ? `<span class="time">⏱ ${escapeHtml(item.time)}</span>` : ""}
        </div>
      </li>
    `).join("");
  }

  // Intenta parsear JSON de atributo; si falla devuelve null
  function tryParseAttrJson(attr) {
    if (!attr) return null;
    try { return JSON.parse(attr); }
    catch (e) { return null; }
  }

  async function loadDataOrFallback(attrData, url) {
    // Primero intenta el atributo (si viene en la etiqueta inyectada)
    const parsed = tryParseAttrJson(attrData);
    if (parsed && Array.isArray(parsed)) return parsed;

    // Si no, intenta fetch al fichero JSON indicado
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("no data");
      const json = await res.json();
      if (Array.isArray(json)) return json;
    } catch (e) {
      console.warn("No se pudo cargar", url, e);
    }
    return []; // fallback vacío
  }

  // Inicializador: espera a que el fragmento inyectado exista
  function waitForSidebarAndInit(timeout = 3000) {
    const start = Date.now();

    const check = async () => {
      const sidebar = document.querySelector("[data-sidebar]");
      if (!sidebar) {
        if (Date.now() - start < timeout) {
          requestAnimationFrame(check);
        } else {
          // Si no aparece en X ms, intentar igualmente (evita bloquear)
          console.warn("site-sidebar: sidebar no encontrado en DOM");
        }
        return;
      }

      // Si se encontró: inicializa
      const olMost = sidebar.querySelector(".sideList");
      const ulRecent = sidebar.querySelector(".recent-list");
      const form = sidebar.querySelector(".subscribe-form");
      const msg = sidebar.querySelector(".subscribe-msg");

      // lee atributos si el HTML incluido los pasó (opcional)
      const mostAttr = sidebar.getAttribute("data-most-read");
      const recentAttr = sidebar.getAttribute("data-recent");

      // Cargar datos (atributo JSON o archivo)
      const most = await loadDataOrFallback(mostAttr, "../data/most-read.json");
      const recent = await loadDataOrFallback(recentAttr, "../data/recent.json");

      // Injectar HTML
      if (olMost) olMost.innerHTML = renderMostRead(most);
      if (ulRecent) ulRecent.innerHTML = renderRecent(recent);

      // Subscribe form behavior (simulado)
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = (form.email && form.email.value || "").trim();
          if (!email) {
            showMsg("Ingresa un correo válido", true);
            return;
          }

          // Aquí puedes hacer un fetch POST real a tu endpoint
          // Ejemplo simulado:
          try {
            // Simular petición
            console.log("Suscripción (simulada):", email);
            showMsg("¡Gracias! Revisa tu correo para confirmar.", false);
            form.reset();
          } catch (err) {
            showMsg("Error enviando. Intenta luego.", true);
          }
        });
      }

      function showMsg(text, isError) {
        if (!msg) return;
        msg.style.display = "block";
        msg.textContent = text;
        msg.style.color = isError ? "#b91c1c" : "#065f46";
        setTimeout(() => msg.style.display = "none", 4000);
      }
    };

    check();
  }

  // Ejecuta al cargar DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForSidebarAndInit(4000));
  } else {
    waitForSidebarAndInit(4000);
  }
})();
