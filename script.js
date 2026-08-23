const params = new URLSearchParams(window.location.search);

const product = {
  name: params.get("name"),
  productionDate: params.get("production"),
  expiryDate: params.get("expiry"),
  lot: params.get("lot")
};

if (!product.name || !product.productionDate || !product.expiryDate || !product.lot) {
  document.getElementById("product").textContent = "منتج غير موجود";
  document.getElementById("production").textContent = "-";
  document.getElementById("expiry").textContent = "-";
  document.getElementById("lot").textContent = "-";
  document.getElementById("status").textContent =
    "⚠️ لم يتم العثور على بيانات المنتج";
} else {
  document.getElementById("product").textContent = product.name;

  document.getElementById("production").textContent =
    formatDate(product.productionDate);

  document.getElementById("expiry").textContent =
    formatDate(product.expiryDate);

  document.getElementById("lot").textContent = product.lot;

  const today = new Date();
  const expiry = new Date(product.expiryDate);

  if (today > expiry) {
    document.getElementById("status").textContent =
      "🔴 المنتج منتهي الصلاحية";
  } else {
    document.getElementById("status").textContent =
      "🟢 المنتج صالح";
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
} 