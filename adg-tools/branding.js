const API_BASE = "https://office.axeldevlab.com/api/index.php";
const API_KEY = "simplekeytouse";
const LS_KEY = "adg_brand_presets_v1";
const MAX_PRESETS = 10;
const clone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const defaultBuilder = {
  width: 1080,
  height: 1080,
  primaryColor: "#003366",
  secondaryColor: "#F59E0B",
  accentColor: "#10B981",
  font: "Poppins",
  headline: "Brand Generator",
  tagline: "Institutional • Digital • Merchandise",
  cta: "Launch Campaign",
  body: "Create unified assets for any touchpoint across Axel Dev Lab.",
  includeQR: false,
  includeIcons: false,
  notes: "",
  logoDataUrl: ""
};

const state = {
  clients: [],
  formats: [],
  catalog: [],
  customCatalogItems: [],
  selectedClient: null,
  selectedFormat: null,
  selectedCatalogItem: null,
  builder: clone(defaultBuilder),
  presets: [],
  offlineMode: true
};

const els = {
  clientSelect: document.getElementById("clientSelect"),
  clientDetails: document.getElementById("clientDetails"),
  preview: document.getElementById("preview"),
  loadDolibarrBtn: document.getElementById("loadDolibarrBtn"),
  autoFillButton: document.getElementById("autoFillButton"),
  presetClientButton: document.getElementById("presetClientButton"),
  formatGrid: document.getElementById("formatGrid"),
  catalogGrid: document.getElementById("catalogGrid"),
  formatSearch: document.getElementById("formatSearch"),
  catalogSearch: document.getElementById("catalogSearch"),
  campaignNotes: document.getElementById("campaignNotes"),
  attachNotesBtn: document.getElementById("attachNotesBtn"),
  customWidth: document.getElementById("customWidth"),
  customHeight: document.getElementById("customHeight"),
  primaryColor: document.getElementById("primaryColor"),
  secondaryColor: document.getElementById("secondaryColor"),
  accentColor: document.getElementById("accentColor"),
  headlineInput: document.getElementById("headlineInput"),
  taglineInput: document.getElementById("taglineInput"),
  ctaInput: document.getElementById("ctaInput"),
  bodyInput: document.getElementById("bodyInput"),
  logoUpload: document.getElementById("logoUpload"),
  fontSelect: document.getElementById("fontSelect"),
  includeQR: document.getElementById("includeQR"),
  includeIcons: document.getElementById("includeIcons"),
  suggestDesign: document.getElementById("suggestDesign"),
  exportPNG: document.getElementById("exportPNG"),
  exportPDF: document.getElementById("exportPDF"),
  exportZIP: document.getElementById("exportZIP"),
  exportCampaign: document.getElementById("exportCampaign"),
  savePreset: document.getElementById("savePreset"),
  loadPreset: document.getElementById("loadPreset"),
  clearPresets: document.getElementById("clearPresets"),
  presetList: document.getElementById("presetList"),
  resetPreview: document.getElementById("resetPreview"),
  offlineToggle: document.getElementById("offlineToggle"),
  addCatalogItem: document.getElementById("addCatalogItem")
};

let formatFilters = { query: "", type: "all" };
let catalogQuery = "";

const fallbackClients = [
  { id: "demo1", name: "Axel Consulting", email: "hello@axelconsulting.com", phone: "+229 90 00 00 00", address: "Cotonou, Benin", clienttype: "Institutional" },
  { id: "demo2", name: "DevLab Ventures", email: "contact@devlab.africa", phone: "+33 1 84 00 00", address: "Paris, France", clienttype: "Corporate" }
];

function initTabs() {
  const buttons = document.querySelectorAll(".adg-tab-button");
  const panels = document.querySelectorAll(".adg-tab-panel");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });
}

async function loadClients() {
  const button = els.loadDolibarrBtn;
  button.disabled = true;
  button.innerText = "Syncing...";
  try {
    const res = await fetch(`${API_BASE}/thirdparties`, {
      headers: { DOLAPIKEY: API_KEY }
    });
    if (!res.ok) throw new Error("Failed to load clients");
    const data = await res.json();
    state.clients = Array.isArray(data) ? data : [];
    if (!state.clients.length) state.clients = fallbackClients;
    toggleOfflineBadge(false);
  } catch (error) {
    console.warn("Dolibarr clients fallback", error);
    state.clients = fallbackClients;
    state.offlineMode = true;
    toggleOfflineBadge(true);
  } finally {
    button.disabled = false;
    button.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Sync Dolibarr Data';
  }
  populateClientSelect();
}

function populateClientSelect() {
  els.clientSelect.innerHTML = '<option value="">Select a client</option>';
  state.clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id || client.rowid || client.ref;
    option.textContent = client.name || client.nom || client.lastname || "Untitled";
    els.clientSelect.appendChild(option);
  });
}

async function autoFillClient() {
  const id = els.clientSelect.value;
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE}/thirdparties/${id}`, {
      headers: { DOLAPIKEY: API_KEY }
    });
    if (!res.ok) throw new Error("Client fetch failed");
    const client = await res.json();
    updateClientDetails(client);
  } catch (error) {
    console.warn("Using cached client details", error);
    const cached = state.clients.find((c) => (c.id || c.rowid || c.ref) == id);
    if (cached) updateClientDetails(cached);
  }
}

function useOfflineClient() {
  const sample = fallbackClients[0];
  updateClientDetails(sample);
}

function updateClientDetails(client) {
  state.selectedClient = client;
  const mapping = {
    name: client.name || client.nom || "—",
    email: client.email || client.email_pro || "—",
    phone: client.phone || client.phone_pro || client.phone_mobile || "—",
    project: client.clienttype || client.ref || "—",
    address: client.address || client.town || "—"
  };
  Object.entries(mapping).forEach(([key, value]) => {
    const field = els.clientDetails.querySelector(`[data-field="${key}"]`);
    if (field) field.textContent = value || "—";
  });
  state.builder.headline = mapping.name;
  state.builder.tagline = client.email || "Let's collaborate";
  state.builder.body = `${mapping.project} | ${mapping.address}`;
  syncBuilderInputs();
  renderPreview();
}

async function loadFormats() {
  try {
    const res = await fetch("formats.json");
    if (!res.ok) throw new Error("Formats missing");
    state.formats = await res.json();
  } catch (error) {
    console.error("formats.json not loaded", error);
    state.formats = [];
  }
  renderFormats();
}

async function loadCatalog() {
  try {
    const res = await fetch("catalog.json");
    if (!res.ok) throw new Error("Catalog missing");
    state.catalog = await res.json();
  } catch (error) {
    console.error("catalog.json not loaded", error);
    state.catalog = [];
  }
  renderCatalog();
}

function renderFormats() {
  const grid = els.formatGrid;
  grid.innerHTML = "";
  const filtered = state.formats.filter((format) => {
    const matchesQuery = format.name.toLowerCase().includes(formatFilters.query.toLowerCase());
    const matchesType = formatFilters.type === "all" || (format.tags || []).includes(formatFilters.type);
    return matchesQuery && matchesType;
  });
  if (!filtered.length) {
    grid.innerHTML = '<p class="text-sm text-slate-500">No formats match your search.</p>';
    return;
  }
  filtered.forEach((format) => {
    const card = document.createElement("article");
    card.className = `rounded-2xl border border-slate-200 p-4 hover:border-[var(--axel-gold)] transition ${state.selectedFormat?.id === format.id ? "border-[var(--axel-gold)]" : ""}`;
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">${format.category}</p>
          <h3 class="text-lg font-semibold">${format.name}</h3>
        </div>
        <span class="text-xs bg-slate-100 px-2 py-1 rounded-full">${format.size}</span>
      </div>
      <p class="mt-2 text-sm text-slate-600">${format.description || ""}</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        ${(format.tags || []).map((tag) => `<span class="px-2 py-1 bg-slate-100 rounded-full capitalize">${tag}</span>`).join("")}
      </div>`;
    card.addEventListener("click", () => {
      state.selectedFormat = format;
      applyFormat(format);
      renderFormats();
    });
    grid.appendChild(card);
  });
}

function renderCatalog() {
  const grid = els.catalogGrid;
  grid.innerHTML = "";
  const data = [...state.catalog];
  state.customCatalogItems.forEach((item) => {
    const category = data.find((cat) => cat.category === item.category);
    if (category) {
      category.items.push(item);
    } else {
      data.push({ category: item.category, items: [item] });
    }
  });
  data.forEach((category) => {
    const wrapper = document.createElement("article");
    wrapper.className = "border border-slate-200 rounded-2xl p-4";
    wrapper.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">${category.category}</p>
          <span class="text-xs text-slate-400">${category.items.length} items</span>
        </div>
        <i class="fa-solid fa-layer-group text-slate-400"></i>
      </div>
      <div class="mt-4 space-y-3"></div>`;
    const list = wrapper.querySelector(".mt-4");
    category.items
      .filter((item) => item.name.toLowerCase().includes(catalogQuery))
      .forEach((item) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `w-full text-left border rounded-2xl px-3 py-3 text-sm hover:border-[var(--axel-gold)] transition ${state.selectedCatalogItem?.name === item.name ? "border-[var(--axel-gold)] bg-amber-50" : "border-slate-200"}`;
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold">${item.name}</p>
              <p class="text-xs text-slate-500">${item.type || "Custom"}</p>
            </div>
            <span class="text-xs text-slate-500">${item.size}</span>
          </div>
          <p class="mt-2 text-xs text-slate-600">${item.description || ""}</p>`;
        card.addEventListener("click", () => {
          state.selectedCatalogItem = item;
          applyCatalogItem(item);
          renderCatalog();
        });
        list.appendChild(card);
      });
    if (!list.children.length) {
      list.innerHTML = '<p class="text-xs text-slate-500">No items match this search.</p>';
    }
    grid.appendChild(wrapper);
  });
}

function applyFormat(format) {
  if (!format) return;
  const dims = parseSize(format.size);
  if (dims) {
    state.builder.width = dims.width;
    state.builder.height = dims.height;
    ElsSetValue(els.customWidth, dims.width);
    ElsSetValue(els.customHeight, dims.height);
  }
  if (format.palette) {
    state.builder.primaryColor = format.palette.primary;
    state.builder.secondaryColor = format.palette.secondary;
    state.builder.accentColor = format.palette.accent;
    els.primaryColor.value = format.palette.primary;
    els.secondaryColor.value = format.palette.secondary;
    els.accentColor.value = format.palette.accent;
  }
  state.builder.headline = format.headline || state.builder.headline;
  state.builder.tagline = format.tagline || state.builder.tagline;
  state.builder.cta = format.cta || state.builder.cta;
  state.builder.body = format.description || state.builder.body;
  syncBuilderInputs();
  renderPreview();
}

function applyCatalogItem(item) {
  if (!item) return;
  const dims = parseSize(item.size);
  if (dims) {
    state.builder.width = dims.width;
    state.builder.height = dims.height;
    ElsSetValue(els.customWidth, dims.width);
    ElsSetValue(els.customHeight, dims.height);
  }
  if (item.presetCopy) {
    state.builder.headline = item.presetCopy.headline;
    state.builder.tagline = item.presetCopy.tagline;
    state.builder.cta = item.presetCopy.cta;
    state.builder.body = item.presetCopy.body;
  }
  syncBuilderInputs();
  renderPreview();
}

function parseSize(size = "") {
  const numeric = size.match(/(\d+)\s*[xX]\s*(\d+)/);
  if (numeric) {
    return { width: Number(numeric[1]), height: Number(numeric[2]) };
  }
  if (size.toLowerCase().includes("a4")) return { width: 210, height: 297 };
  if (size.toLowerCase().includes("a5")) return { width: 148, height: 210 };
  return null;
}

function ElsSetValue(el, value) {
  if (el) el.value = value;
}

function syncBuilderInputs() {
  ElsSetValue(els.customWidth, state.builder.width);
  ElsSetValue(els.customHeight, state.builder.height);
  ElsSetValue(els.headlineInput, state.builder.headline);
  ElsSetValue(els.taglineInput, state.builder.tagline);
  ElsSetValue(els.ctaInput, state.builder.cta);
  ElsSetValue(els.bodyInput, state.builder.body);
  ElsSetValue(els.primaryColor, state.builder.primaryColor);
  ElsSetValue(els.secondaryColor, state.builder.secondaryColor);
  ElsSetValue(els.accentColor, state.builder.accentColor);
  if (els.fontSelect) els.fontSelect.value = state.builder.font;
  if (els.includeQR) els.includeQR.checked = !!state.builder.includeQR;
  if (els.includeIcons) els.includeIcons.checked = !!state.builder.includeIcons;
  ElsSetValue(els.campaignNotes, state.builder.notes || "");
}

function attachBuilderEvents() {
  els.customWidth.addEventListener("input", () => updateDimension("width", els.customWidth.value));
  els.customHeight.addEventListener("input", () => updateDimension("height", els.customHeight.value));
  document.querySelectorAll(".dimension-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDimension("width", btn.dataset.width);
      updateDimension("height", btn.dataset.height);
    });
  });
  ["primaryColor", "secondaryColor", "accentColor"].forEach((colorKey) => {
    els[colorKey].addEventListener("input", () => {
      state.builder[colorKey] = els[colorKey].value;
      renderPreview();
    });
  });
  document.querySelectorAll(".preset-color").forEach((btn) => {
    btn.addEventListener("click", () => {
      const colors = JSON.parse(btn.dataset.colors);
      state.builder.primaryColor = colors.primary;
      state.builder.secondaryColor = colors.secondary;
      state.builder.accentColor = colors.accent;
      els.primaryColor.value = colors.primary;
      els.secondaryColor.value = colors.secondary;
      els.accentColor.value = colors.accent;
      renderPreview();
    });
  });
  els.headlineInput.addEventListener("input", () => { state.builder.headline = els.headlineInput.value; renderPreview(); });
  els.taglineInput.addEventListener("input", () => { state.builder.tagline = els.taglineInput.value; renderPreview(); });
  els.ctaInput.addEventListener("input", () => { state.builder.cta = els.ctaInput.value; renderPreview(); });
  els.bodyInput.addEventListener("input", () => { state.builder.body = els.bodyInput.value; renderPreview(); });
  els.fontSelect.addEventListener("change", () => {
    state.builder.font = els.fontSelect.value;
    ensureFontLoaded(state.builder.font);
    renderPreview();
  });
  els.includeQR.addEventListener("change", () => { state.builder.includeQR = els.includeQR.checked; renderPreview(); });
  els.includeIcons.addEventListener("change", () => { state.builder.includeIcons = els.includeIcons.checked; renderPreview(); });
  els.logoUpload.addEventListener("change", handleLogoUpload);
  els.suggestDesign.addEventListener("click", suggestDesign);
}

function updateDimension(key, value) {
  const numericValue = Number(value) || state.builder[key];
  state.builder[key] = numericValue;
  if (key === "width") els.customWidth.value = numericValue;
  if (key === "height") els.customHeight.value = numericValue;
  renderPreview();
}

function ensureFontLoaded(fontName) {
  const id = `font-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;600&display=swap`;
    document.head.appendChild(link);
  }
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.builder.logoDataUrl = reader.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
}

function suggestDesign() {
  const palettes = [
    { primary: "#003366", secondary: "#0EA5E9", accent: "#F59E0B" },
    { primary: "#111827", secondary: "#F97316", accent: "#10B981" },
    { primary: "#1F2937", secondary: "#A855F7", accent: "#FDE047" },
    { primary: "#0F172A", secondary: "#22D3EE", accent: "#FB7185" }
  ];
  const random = palettes[Math.floor(Math.random() * palettes.length)];
  state.builder.primaryColor = random.primary;
  state.builder.secondaryColor = random.secondary;
  state.builder.accentColor = random.accent;
  els.primaryColor.value = random.primary;
  els.secondaryColor.value = random.secondary;
  els.accentColor.value = random.accent;
  state.builder.font = ["Poppins", "Inter", "Lato", "Montserrat"][Math.floor(Math.random() * 4)];
  els.fontSelect.value = state.builder.font;
  ensureFontLoaded(state.builder.font);
  renderPreview();
}

function renderPreview() {
  const { width, height, primaryColor, secondaryColor, accentColor, font, headline, tagline, body, cta, includeQR, includeIcons, notes, logoDataUrl } = state.builder;
  const formatTag = state.selectedFormat ? state.selectedFormat.name : "Custom Format";
  const catalogTag = state.selectedCatalogItem ? state.selectedCatalogItem.name : "Catalog";
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
  els.preview.style.fontFamily = `'${font}', 'Poppins', 'Inter', sans-serif`;
  els.preview.style.background = gradient;
  els.preview.style.color = "white";
  if (width && height) {
    els.preview.style.aspectRatio = `${width} / ${height}`;
  }
  els.preview.innerHTML = `
    <div class="text-xs uppercase tracking-[0.4em] text-white/70">${formatTag}</div>
    <div class="text-xs text-white/80">${catalogTag} · ${width} × ${height}</div>
    ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" class="h-12 w-auto object-contain mt-2">` : ""}
    <h2 class="text-3xl font-bold leading-tight">${headline}</h2>
    <p class="text-sm text-white/80">${tagline}</p>
    <p class="text-base mt-2 text-white/90">${body}</p>
    ${notes ? `<p class="text-xs text-white/70 mt-2">Notes: ${notes}</p>` : ""}
    <button class="mt-4 px-5 py-2 rounded-full" style="background:${accentColor}; color:${primaryColor}">${cta || "Call to Action"}</button>
    ${includeIcons ? renderIconRow() : ""}
    ${includeQR ? renderQRPlaceholder(accentColor) : ""}
    ${renderMockupLayer()}`;
}

function renderIconRow() {
  return `<div class="mt-4 flex gap-3 text-lg text-white/80">
    <i class="fa-solid fa-bolt"></i>
    <i class="fa-solid fa-chart-pie"></i>
    <i class="fa-solid fa-globe"></i>
  </div>`;
}

function renderQRPlaceholder(color) {
  return `<div class="mt-4 flex items-center gap-3 text-xs text-white/60">
    <div class="h-16 w-16 border-4" style="border-color:${color};"></div>
    <span>Scan for deck</span>
  </div>`;
}

function renderMockupLayer() {
  if (!state.selectedCatalogItem) return "";
  if (state.selectedCatalogItem.type?.toLowerCase() === "apparel") {
    return `<div class="mt-4 w-full h-32 bg-white/10 rounded-2xl flex items-center justify-center text-xs uppercase tracking-wide">T-Shirt Mockup</div>`;
  }
  if (state.selectedCatalogItem.type?.toLowerCase() === "merch") {
    return `<div class="mt-4 w-full h-28 bg-white/10 rounded-full flex items-center justify-center text-xs uppercase tracking-wide">Mug Preview</div>`;
  }
  return "";
}

function handleNotesAttach() {
  state.builder.notes = els.campaignNotes.value;
  renderPreview();
}

function addCustomCatalogItem() {
  const name = prompt("Item name (e.g., Campus Banner)");
  if (!name) return;
  const size = prompt("Size (e.g., 1080x1920)", "1080x1920");
  const type = prompt("Type (Digital/Print/Merch/Apparel)", "Digital");
  const category = prompt("Category", "Custom");
  const customItem = {
    name,
    size: size || "1080x1080",
    type: type || "Digital",
    category: category || "Custom",
    description: "Custom item",
    presetCopy: { headline: name, tagline: type || "Digital", body: "Custom generated item", cta: "Go" }
  };
  state.customCatalogItems.push(customItem);
  state.selectedCatalogItem = customItem;
  applyCatalogItem(customItem);
  renderCatalog();
}

function toggleOfflineBadge(force) {
  const badge = els.offlineToggle.querySelector("span");
  state.offlineMode = typeof force === "boolean" ? force : !state.offlineMode;
  badge.classList.toggle("bg-green-500", state.offlineMode);
  badge.classList.toggle("bg-red-500", !state.offlineMode);
}

async function exportPNG() {
  const canvas = await html2canvas(els.preview, { scale: 2 });
  const dataUrl = canvas.toDataURL("image/png");
  downloadDataUrl(dataUrl, `${slugify(state.builder.headline)}.png`);
}

async function exportPDF() {
  const canvas = await html2canvas(els.preview, { scale: 2, backgroundColor: null });
  const data = canvas.toDataURL("image/png");
  const pdf = new window.jspdf.jsPDF({ orientation: state.builder.width > state.builder.height ? "landscape" : "portrait", unit: "px", format: [state.builder.width, state.builder.height] });
  pdf.addImage(data, "PNG", 0, 0, state.builder.width, state.builder.height);
  pdf.save(`${slugify(state.builder.headline)}.pdf`);
}

async function exportZIP() {
  const zip = new window.JSZip();
  const canvas = await html2canvas(els.preview, { scale: 2 });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve));
  zip.file("design.png", blob);
  zip.file("metadata.json", JSON.stringify({ client: state.selectedClient, format: state.selectedFormat, catalog: state.selectedCatalogItem, builder: state.builder }, null, 2));
  if (state.selectedFormat?.category === "Institutional") {
    zip.file("institutional-pack.txt", "Includes letterhead, cover, and slide placeholders.");
  }
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, `${slugify(state.builder.headline)}.zip`);
}

async function exportCampaignKit() {
  const sizes = [
    { label: "Square", width: 1080, height: 1080 },
    { label: "Story", width: 1080, height: 1920 },
    { label: "Wide", width: 1920, height: 1080 }
  ];
  const zip = new window.JSZip();
  for (const size of sizes) {
    const originalWidth = state.builder.width;
    const originalHeight = state.builder.height;
    state.builder.width = size.width;
    state.builder.height = size.height;
    renderPreview();
    const canvas = await html2canvas(els.preview, { scale: 2 });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve));
    zip.file(`${size.label.toLowerCase()}-${slugify(state.builder.headline)}.png`, blob);
    state.builder.width = originalWidth;
    state.builder.height = originalHeight;
    renderPreview();
  }
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, `${slugify(state.builder.headline)}-campaign-kit.zip`);
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function savePreset() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    if (stored.length >= MAX_PRESETS) stored.shift();
    stored.push({
      timestamp: Date.now(),
      state: clone(state.builder),
      format: state.selectedFormat,
      catalog: state.selectedCatalogItem
    });
    localStorage.setItem(LS_KEY, JSON.stringify(stored));
    state.presets = stored;
    renderPresetList();
  } catch (error) {
    console.error("Preset save failed", error);
  }
}

function loadPreset() {
  const stored = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  if (!stored.length) return;
  const last = stored[stored.length - 1];
  Object.assign(state.builder, last.state);
  state.selectedFormat = last.format;
  state.selectedCatalogItem = last.catalog;
  syncBuilderInputs();
  renderPreview();
}

function clearPresets() {
  localStorage.removeItem(LS_KEY);
  state.presets = [];
  renderPresetList();
}

function renderPresetList() {
  const list = els.presetList;
  const stored = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  list.innerHTML = "";
  stored.slice().reverse().forEach((preset, idx) => {
    const item = document.createElement("li");
    const date = new Date(preset.timestamp).toLocaleString();
    item.className = "preset-item flex items-center justify-between";
    item.innerHTML = `<span>${preset.state.headline}</span><span class="text-[10px] text-slate-500">${date}</span>`;
    item.addEventListener("click", () => {
      Object.assign(state.builder, preset.state);
      state.selectedFormat = preset.format;
      state.selectedCatalogItem = preset.catalog;
      syncBuilderInputs();
      renderPreview();
    });
    list.appendChild(item);
  });
}

function loadPresetsFromStorage() {
  try {
    state.presets = JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch (error) {
    state.presets = [];
  }
  renderPresetList();
}

function handleSearchInputs() {
  els.formatSearch.addEventListener("input", (e) => {
    formatFilters.query = e.target.value;
    renderFormats();
  });
  document.querySelectorAll(".format-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".format-filter").forEach((el) => el.classList.remove("bg-[var(--axel-gold)]", "text-white"));
      btn.classList.add("bg-[var(--axel-gold)]", "text-white");
      formatFilters.type = btn.dataset.filter;
      renderFormats();
    });
  });
  els.catalogSearch.addEventListener("input", (e) => {
    catalogQuery = e.target.value.toLowerCase();
    renderCatalog();
  });
  const defaultFilter = document.querySelector('.format-filter[data-filter="all"]');
  if (defaultFilter) defaultFilter.classList.add("bg-[var(--axel-gold)]", "text-white");
}

function resetPreview() {
  Object.assign(state.builder, clone(defaultBuilder));
  state.selectedCatalogItem = null;
  state.selectedFormat = null;
  syncBuilderInputs();
  renderPreview();
}

function initEvents() {
  els.loadDolibarrBtn.addEventListener("click", loadClients);
  els.autoFillButton.addEventListener("click", autoFillClient);
  els.clientSelect.addEventListener("change", autoFillClient);
  els.presetClientButton.addEventListener("click", useOfflineClient);
  els.attachNotesBtn.addEventListener("click", handleNotesAttach);
  els.exportPNG.addEventListener("click", exportPNG);
  els.exportPDF.addEventListener("click", exportPDF);
  els.exportZIP.addEventListener("click", exportZIP);
  els.exportCampaign.addEventListener("click", exportCampaignKit);
  els.savePreset.addEventListener("click", savePreset);
  els.loadPreset.addEventListener("click", loadPreset);
  els.clearPresets.addEventListener("click", clearPresets);
  els.resetPreview.addEventListener("click", resetPreview);
  els.offlineToggle.addEventListener("click", () => toggleOfflineBadge());
  els.addCatalogItem.addEventListener("click", addCustomCatalogItem);
  attachBuilderEvents();
  handleSearchInputs();
}

function init() {
  initTabs();
  initEvents();
  loadPresetsFromStorage();
  loadFormats();
  loadCatalog();
  loadClients();
  renderPreview();
  toggleOfflineBadge(true);
}

document.addEventListener("DOMContentLoaded", init);
