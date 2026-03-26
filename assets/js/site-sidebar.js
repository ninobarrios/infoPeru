(function () {
  function escapeHtml(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderMostRead(list) {
    return list.map((item, i) => `
      <li class="sideList__item">
        <span class="sideList__rank">${i + 1}</span>
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

  function tryParseAttrJson(attr) {
    if (!attr) return null;
    try { return JSON.parse(attr); }
    catch (e) { return null; }
  }

  async function loadDataOrFallback(attrData, url) {
    const parsed = tryParseAttrJson(attrData);
    if (parsed && Array.isArray(parsed)) return parsed;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("no data");
      const json = await res.json();
      if (Array.isArray(json)) return json;
    } catch (e) {
      console.warn("No se pudo cargar", url, e);
    }
    return []; 
  }

  function waitForSidebarAndInit(timeout = 3000) {
    const start = Date.now();

    const check = async () => {
      const sidebar = document.querySelector("[data-sidebar]");
      if (!sidebar) {
        if (Date.now() - start < timeout) {
          requestAnimationFrame(check);
        } else {
          console.warn("site-sidebar: sidebar no encontrado en DOM");
        }
        return;
      }

      const olMost = sidebar.querySelector(".sideList");
      const ulRecent = sidebar.querySelector(".recent-list");
      const form = sidebar.querySelector(".subscribe-form");
      const msg = sidebar.querySelector(".subscribe-msg");

      const mostAttr = sidebar.getAttribute("data-most-read");
      const recentAttr = sidebar.getAttribute("data-recent");

      const most = await loadDataOrFallback(mostAttr, "../../data/most-read.json");
      const recent = await loadDataOrFallback(recentAttr, "../../data/recent.json");

      if (olMost) olMost.innerHTML = renderMostRead(most);
      if (ulRecent) ulRecent.innerHTML = renderRecent(recent);

      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault(); 

          const email = (form.email && form.email.value || "").trim();
          if (!email) {
            showMsg("Ingresa un correo válido", true);
            return;
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForSidebarAndInit(4000));
  } else {
    waitForSidebarAndInit(4000);
  }
})();
