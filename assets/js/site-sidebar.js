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


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForSidebarAndInit(4000));
  } else {
    waitForSidebarAndInit(4000);
  }
})();
