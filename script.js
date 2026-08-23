const product = {
  name: "عصير برتقال",
  productionDate: "2026-08-20",
  expiryDate: "2026-09-20",
  lot: "LOT-001"
};

document.getElementById("product").textContent = product.name;
document.getElementById("production").textContent =
  formatDate(product.productionDate);
document.getElementById("expiry").textContent =
  formatDate(product.expiryDate);
document.getElementById("lot").textContent = product.lot;

const today = new Date();
const expiry = new Date(product.expiryDate);
const status = document.getElementById("status");

if (today > expiry) {
  status.textContent = "🔴 المنتج منتهي الصلاحية";
} else {
  status.textContent = "🟢 المنتج صالح";
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
