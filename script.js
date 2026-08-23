// بيانات المنتجات التجريبية
const products = {
  "LOT-001": {
    name: "عصير برتقال",
    productionDate: "2026-08-20",
    expiryDate: "2026-09-20",
    lot: "LOT-001"
  },

  "LOT-002": {
    name: "حليب",
    productionDate: "2026-08-15",
    expiryDate: "2026-09-15",
    lot: "LOT-002"
  }
};

// قراءة رقم المنتج من الرابط
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// البحث عن المنتج
const product = products[productId];

if (!product) {
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

  // التحقق من الصلاحية
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

// تحويل التاريخ إلى صيغة عربية
function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
