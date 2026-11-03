/**
 * scripts/seed-invoice.js
 * 
 * Seeds a realistic 20-item invoice directly to a user's Cloud Firestore account.
 * 
 * Usage:
 *   node scripts/seed-invoice.js <USER_EMAIL> <PASSWORD> [INVOICE_NO]
 * 
 * Example:
 *   node scripts/seed-invoice.js bachirak47@gmail.com your_password 5
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCMtGX1hNqDmCO_-AgjveDRt40pDtW-MoI",
  authDomain: "billing-mobile-app.firebaseapp.com",
  projectId: "billing-mobile-app",
  storageBucket: "billing-mobile-app.firebasestorage.app",
  messagingSenderId: "674033662205",
  appId: "1:674033662205:web:eba141611bfac8f57c2694",
};

const SAMPLE_20_ITEMS = [
  { sNo: "1", name: "Basmati Rice", qty: "10", unit: "KG", price: "90", discountPercent: "10", discountAmount: "90.00", amt: "810.00" },
  { sNo: "2", name: "Sona Masoori Rice", qty: "10", unit: "KG", price: "40", discountPercent: "", discountAmount: "0.00", amt: "400.00" },
  { sNo: "3", name: "Wheat Atta", qty: "20", unit: "KG", price: "40", discountPercent: "5", discountAmount: "40.00", amt: "760.00" },
  { sNo: "4", name: "Maida Flour", qty: "5", unit: "KG", price: "45", discountPercent: "", discountAmount: "0.00", amt: "225.00" },
  { sNo: "5", name: "Masoor Dal And Basmati Golden Rice", qty: "8", unit: "KG", price: "200", discountPercent: "10", discountAmount: "160.00", amt: "1440.00" },
  { sNo: "6", name: "Toor Dal", qty: "5", unit: "KG", price: "140", discountPercent: "", discountAmount: "0.00", amt: "700.00" },
  { sNo: "7", name: "Moong Dal", qty: "3", unit: "KG", price: "120", discountPercent: "5", discountAmount: "18.00", amt: "342.00" },
  { sNo: "8", name: "Mustard Oil", qty: "5", unit: "L", price: "160", discountPercent: "", discountAmount: "0.00", amt: "800.00" },
  { sNo: "9", name: "Sunflower Oil", qty: "10", unit: "L", price: "160", discountPercent: "12.5", discountAmount: "200.00", amt: "1400.00" },
  { sNo: "10", name: "Desi Ghee", qty: "2", unit: "KG", price: "650", discountPercent: "", discountAmount: "100.00", amt: "1200.00" },
  { sNo: "11", name: "Turmeric Powder", qty: "2", unit: "KG", price: "220", discountPercent: "", discountAmount: "0.00", amt: "440.00" },
  { sNo: "12", name: "Red Chilli Powder", qty: "2", unit: "KG", price: "280", discountPercent: "10", discountAmount: "56.00", amt: "504.00" },
  { sNo: "13", name: "Coriander Powder", qty: "1", unit: "KG", price: "180", discountPercent: "", discountAmount: "0.00", amt: "180.00" },
  { sNo: "14", name: "Cumin Seeds", qty: "1", unit: "KG", price: "350", discountPercent: "", discountAmount: "0.00", amt: "350.00" },
  { sNo: "15", name: "Black Pepper", qty: "0.5", unit: "KG", price: "700", discountPercent: "", discountAmount: "0.00", amt: "350.00" },
  { sNo: "16", name: "Green Cardamom", qty: "0.25", unit: "KG", price: "1800", discountPercent: "", discountAmount: "50.00", amt: "400.00" },
  { sNo: "17", name: "Kabuli Chana", qty: "5", unit: "KG", price: "120", discountPercent: "8", discountAmount: "48.00", amt: "552.00" },
  { sNo: "18", name: "Rajma Beans", qty: "4", unit: "KG", price: "140", discountPercent: "", discountAmount: "0.00", amt: "560.00" },
  { sNo: "19", name: "Marie Gold Biscuit", qty: "15", unit: "PKT", price: "35", discountPercent: "5", discountAmount: "26.25", amt: "498.75" },
  { sNo: "20", name: "Baby Soap", qty: "10", unit: "PCS", price: "98", discountPercent: "10", discountAmount: "98.00", amt: "882.00" },
];

const SAMPLE_10_ITEMS = [
  { sNo: "1", name: "Premium Long Grain Organic Jasmine Rice", qty: "5", unit: "KG", price: "180", discountPercent: "15", discountAmount: "135.00", amt: "765.00" },
  { sNo: "2", name: "Salt", qty: "2", unit: "KG", price: "25", discountPercent: "", discountAmount: "0.00", amt: "50.00" },
  { sNo: "3", name: "Extra Virgin Cold Pressed Olive Oil Blend", qty: "2", unit: "L", price: "850", discountPercent: "10", discountAmount: "170.00", amt: "1530.00" },
  { sNo: "4", name: "Tea", qty: "1", unit: "KG", price: "290", discountPercent: "", discountAmount: "0.00", amt: "290.00" },
  { sNo: "5", name: "Whole Wheat Multi Grain Breakfast Cereal Flakes", qty: "3", unit: "KG", price: "320", discountPercent: "5", discountAmount: "48.00", amt: "912.00" },
  { sNo: "6", name: "Oats", qty: "4", unit: "KG", price: "150", discountPercent: "", discountAmount: "0.00", amt: "600.00" },
  { sNo: "7", name: "Pure Natural Organic Wildflower Honey Bottle", qty: "2", unit: "KG", price: "450", discountPercent: "20", discountAmount: "180.00", amt: "720.00" },
  { sNo: "8", name: "Poha", qty: "5", unit: "KG", price: "60", discountPercent: "", discountAmount: "0.00", amt: "300.00" },
  { sNo: "9", name: "Dark Roasted Arabica Coffee Beans Pack", qty: "1", unit: "KG", price: "950", discountPercent: "8", discountAmount: "76.00", amt: "874.00" },
  { sNo: "10", name: "Sugar", qty: "10", unit: "KG", price: "45", discountPercent: "", discountAmount: "0.00", amt: "450.00" }
];


async function seed() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const invoiceNo = args[2] || "5";

  if (!email || !password) {
    console.log("❌ Missing arguments!");
    console.log("Usage: node scripts/seed-invoice.js <USER_EMAIL> <PASSWORD> [INVOICE_NO]");
    process.exit(1);
  }

  try {
    console.log(`Connecting to Firebase as ${email}...`);
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    console.log(`✅ Authenticated! User UID: ${uid}`);

    // Calculate totals across items with discounts
    let totalQty = 0;
    let grossSubtotal = 0;
    let totalDiscount = 0;
    let finalAmount = 0;

    // change items obj name for seed
    for (const item of SAMPLE_10_ITEMS) {
      const q = parseFloat(item.qty) || 0;
      const p = parseFloat(item.price) || 0;
      const lineGross = q * p;
      const discAmt = parseFloat(item.discountAmount) || 0;
      const lineNet = parseFloat(item.amt) || (lineGross - discAmt);

      totalQty += q;
      grossSubtotal += lineGross;
      totalDiscount += discAmt;
      finalAmount += lineNet;
    }

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const invoicePayload = {
      invoiceNo: invoiceNo,
      date: dateStr,
      time: timeStr,
      shopName: "Delivery Slip",
      customerName: "Basir Ahmed Khan",
      customerPhone: "7638089476",
      status: "PAID",
      totalQty: totalQty.toString(),
      subtotal: grossSubtotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      grandTotal: finalAmount.toFixed(2),
      //change items obj name for seed
      items: SAMPLE_10_ITEMS,
      updatedAt: Date.now(),
    };

    console.log(`Pushing 20-item Invoice #${invoiceNo} (Subtotal: ₹${grossSubtotal.toFixed(2)}, Discount: -₹${totalDiscount.toFixed(2)}, Final: ₹${finalAmount.toFixed(2)}) to /users/${uid}/invoices/${invoiceNo}...`);
    await setDoc(doc(db, "users", uid, "invoices", invoiceNo), invoicePayload, { merge: true });

    console.log(`🎉 SUCCESS! Invoice #${invoiceNo} with 20 items (Final: ₹${finalAmount.toFixed(2)}) has been seeded!`);
    console.log(`Open your app or pull-to-refresh on Invoices tab to see it live.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message || err);
    process.exit(1);
  }
}

seed();

