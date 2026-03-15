async function loadIncludes() {
  const slots = document.querySelectorAll("[data-include]");

  await Promise.all([...slots].map(async (el) => {
    const url = el.getAttribute("data-include");

    try {
      const res = await fetch(url, { cache: "no-store" });

      console.log("Include:", url, "Status:", res.status);

      if (!res.ok) {
        el.innerHTML = `<p style="color:red">No se pudo cargar: ${url} (status ${res.status})</p>`;
        return;
      }

      const html = await res.text();
      console.log("Include length:", html.length);
      el.innerHTML = html;
    } catch (err) {
      console.error("Include error:", url, err);
      el.innerHTML = `<p style="color:red">Error cargando: ${url}</p>`;
    }
  }));
}

document.addEventListener("DOMContentLoaded", loadIncludes);
