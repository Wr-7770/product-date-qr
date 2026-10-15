َ(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "productDateQr.products.v1";

  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function getProducts() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function formatDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function statusFor(expiry) {
    if (!expiry || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
      return { text: "تاريخ غير متاح", className: "expired" };
    }
    if (expiry < todayISO()) {
      return { text: "🔴 منتهي الصلاحية", className: "expired" };
    }
    return { text: "🟢 المنتج صالح حسب التاريخ", className: "valid" };
  }

  function showMessage(text, type = "error") {
    const el = $("formMessage");
    if (!el) return;
    el.textContent = text;
    el.className = "form-message " + type;
    el.hidden = false;
  }

  function clearMessage() {
    const el = $("formMessage");
    if (el) {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function productPageUrl(product) {
    const url = new URL("index.html", window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("id", product.id || "");
    url.searchParams.set("name", product.name);
    url.searchParams.set("production", product.production);
    url.searchParams.set("expiry", product.expiry);
    url.searchParams.set("lot", product.lot);
    return url.href;
  }

  function displayQr(product) {
    const qrUrl =
      "https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=" +
      encodeURIComponent(product.url);

    $("qrResult").hidden = false;
    $("qrImage").src = qrUrl;
    $("productUrl").value = product.url;
    $("resultName").textContent = product.name;
    $("resultDates").textContent =
      "الإنتاج: " + formatDate(product.production) +
      " · الانتهاء: " + formatDate(product.expiry);
    $("downloadQr").href = qrUrl;
    $("openProduct").href = product.url;
  }

  function renderProducts() {
    const list = $("productsList");
    if (!list) return;
    list.replaceChildren();

    const products = getProducts();

    if (products.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "لا توجد منتجات في السجل حتى الآن.";
      list.appendChild(empty);
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const top = document.createElement("div");
      top.className = "product-top";

      const name = document.createElement("div");
      name.className = "product-name";
      name.textContent = product.name || "منتج بدون اسم";

      const status = statusFor(product.expiry);
      const badge = document.createElement("span");
      badge.className = "status " + status.className;
      badge.textContent = status.text;
      top.append(name, badge);

      const lot = document.createElement("p");
      lot.textContent = "رقم التشغيلة: " + (product.lot || "—");

      const production = document.createElement("p");
      production.textContent = "تاريخ الإنتاج: " + formatDate(product.production);

      const expiry = document.createElement("p");
      expiry.textContent = "تاريخ الانتهاء: " + formatDate(product.expiry);

      const actions = document.createElement("div");
      actions.className = "product-actions";

      const open = document.createElement("a");
      open.className = "button dark";
      open.textContent = "فتح صفحة";
      open.href = product.url || productPageUrl(product);
      open.target = "_blank";
      open.rel = "noopener";

      const remove = document.createElement("button");
      remove.className = "button danger-outline";
      remove.type = "button";
      remove.textContent = "حذف المنتج";
      remove.addEventListener("click", () => {
        if (!window.confirm("هل تريد حذف هذا المنتج من السجل؟")) return;
        saveProducts(getProducts().filter((item) => item.id !== product.id));
        renderProducts();
      });

      actions.append(open, remove);
      card.append(top, lot, production, expiry, actions);
      list.appendChild(card);
    });
  }

  function initAdmin() {
    const form = $("productForm");
    if (!form) return;

    $("productionDate").max = todayISO();

    $("productionDate").addEventListener("change", () => {
      const production = $("productionDate").value;
      $("expiryDate").min = production || "";

      if (production && production > todayISO()) {
        showMessage("تاريخ الإنتاج لا يمكن أن يكون في المستقبل.");
      } else {
        clearMessage();
      }
    });

    $("expiryDate").addEventListener("change", () => {
      const production = $("productionDate").value;
      const expiry = $("expiryDate").value;

      if (production && expiry && expiry < production) {
        showMessage("تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ الإنتاج.");
      } else {
        clearMessage();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearMessage();

      const name = $("productName").value.trim();
      const lot = $("productLot").value.trim();
      const production = $("productionDate").value;
      const expiry = $("expiryDate").value;

      if (!name) return showMessage("اكتب اسم المنتج.");
      if (!lot) return showMessage("اكتب رقم التشغيلة.");
      if (!production) return showMessage("اختر تاريخ الإنتاج.");
      if (!expiry) return showMessage("اختر تاريخ الانتهاء.");
      if (production > todayISO()) {
        return showMessage("تاريخ الإنتاج لا يمكن أن يكون في المستقبل.");
      }
      if (expiry < production) {
        return showMessage("تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ الإنتاج.");
      }

      const product = {
        id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
        name,
        lot,
        production,
        expiry,
        createdAt: new Date().toISOString()
      };

      product.url = productPageUrl(product);

      const products = getProducts();
      products.unshift(product);

      try {
        saveProducts(products);
      } catch {
        return showMessage("تعذر حفظ السجل في المتصفح. حاول حذف بعض بيانات المتصفح.");
      }

      displayQr(product);
      renderProducts();
      showMessage("تم إنشاء رابط المنتج ورمز QR بنجاح.", "success");
      $("qrResult").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("copyLinkButton").addEventListener("click", () => {
      const input = $("productUrl");
      input.focus();
      input.select();

      try {
        const copied = document.execCommand("copy");
        if (copied) {
          $("copyLinkButton").textContent = "تم نسخ الرابط ✓";
        } else {
          showMessage("حدّد الرابط ثم انسخه يدويًا.");
        }
      } catch {
        showMessage("حدّد الرابط ثم انسخه يدويًا.");
      }
    });

    $("clearHistoryButton").addEventListener("click", () => {
      const products = getProducts();

      if (!products.length) {
        window.alert("السجل فارغ بالفعل.");
        return;
      }

      if (!window.confirm("هل تريد حذف سجل المنتجات من هذا المتصفح؟")) return;

      localStorage.removeItem(STORAGE_KEY);
      $("qrResult").hidden = true;
      clearMessage();
      renderProducts();
    });

    renderProducts();
  }

  function initProductPage() {
    const target = $("productDetails");
    if (!target) return;

    const params = new URLSearchParams(window.location.search);
    const product = {
      name: (params.get("name") || "").trim(),
      production: (params.get("production") || "").trim(),
      expiry: (params.get("expiry") || "").trim(),
      lot: (params.get("lot") || "").trim()
    };

    if (!product.name || !product.production || !product.expiry || !product.lot) {
      target.replaceChildren();

      const box = document.createElement("div");
      box.className = "missing-product";

      const heading = document.createElement("h2");
      heading.textContent = "لم يتم العثور على بيانات المنتج";

      const message = document.createElement("p");
      message.textContent = "افتح رابط QR الصحيح الذي أنشأته لوحة إدارة المنتجات.";

      const link = document.createElement("a");
      link.className = "button primary";
      link.href = "admin.html";
      link.textContent = "الانتقال إلى إدارة المنتجات";

      box.append(heading, message, link);
      target.appendChild(box);
      return;
    }

    target.replaceChildren();

    const row = document.createElement("div");
    row.className = "product-title-row";

    const heading = document.createElement("h2");
    heading.className = "product-title";
    heading.textContent = product.name;

    const status = statusFor(product.expiry);
    const badge = document.createElement("span");
    badge.className = "status product-status " + status.className;
    badge.textContent = status.text;
    row.append(heading, badge);

    const grid = document.createElement("div");
    grid.className = "detail-grid";

    const details = [
      ["تاريخ الإنتاج", formatDate(product.production)],
      ["تاريخ الانتهاء", formatDate(product.expiry)],
      ["رقم التشغيلة", product.lot],
      ["حالة التاريخ", status.text]
    ];

    details.forEach(([labelText, valueText]) => {
      const item = document.createElement("div");
      item.className = "detail-item";

      const label = document.createElement("span");
      label.className = "detail-label";
      label.textContent = labelText;

      const value = document.createElement("div");
      value.className = "detail-value";
      value.textContent = valueText;

      item.append(label, value);
      grid.appendChild(item);
    });

    target.append(row, grid);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "admin") initAdmin();
    if (document.body.dataset.page === "product") initProductPage();
  });
})();
