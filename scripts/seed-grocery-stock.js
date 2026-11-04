/**
 * scripts/seed-grocery-stock.js
 * 
 * Production Batch Seeder for FlashBill POS Inventory Catalog.
 * Seeds all 341 cleaned grocery stock items directly into Cloud Firestore
 * under the authenticated user's account: users/{uid}/items/{itemId}
 * 
 * Usage:
 *   node scripts/seed-grocery-stock.js <USER_EMAIL> <PASSWORD>
 * 
 * Example:
 *   node scripts/seed-grocery-stock.js bachirak47@gmail.com your_password
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, writeBatch } = require('firebase/firestore');
const { groceryStock, reportMeta } = require('./groceryStock.js');

const firebaseConfig = {
  apiKey: "AIzaSyCMtGX1hNqDmCO_-AgjveDRt40pDtW-MoI",
  authDomain: "billing-mobile-app.firebaseapp.com",
  projectId: "billing-mobile-app",
  storageBucket: "billing-mobile-app.firebasestorage.app",
  messagingSenderId: "674033662205",
  appId: "1:674033662205:web:eba141611bfac8f57c2694",
};

async function seedGroceryStock() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];

  if (!email || !password) {
    console.error('\n❌ Missing authentication credentials!');
    console.log('Usage:   node scripts/seed-grocery-stock.js <USER_EMAIL> <PASSWORD>');
    console.log('Example: node scripts/seed-grocery-stock.js bachirak47@gmail.com mypassword123\n');
    process.exit(1);
  }

  console.log('\n========================================================');
  console.log('📦 FlashBill POS - Cloud Firestore Inventory Seeder');
  console.log('========================================================');
  console.log(`Source Catalog:      ${reportMeta.sourceFile || 'Stock_Summary_Report'}`);
  console.log(`Total Valid Items:   ${groceryStock.length} items`);
  console.log(`Artifacts Filtered:  ${reportMeta.zeroPriceArtifactsRemoved || 9} zero-price items`);
  console.log(`Connecting as:       ${email}...`);

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    console.log(`✅ Authenticated! Firebase UID: ${uid}`);

    const CHUNK_SIZE = 200; // Safe buffer below Firestore 500-op limit
    const totalChunks = Math.ceil(groceryStock.length / CHUNK_SIZE);
    let seededCount = 0;

    console.log(`\nWriting ${groceryStock.length} items to users/${uid}/items in ${totalChunks} batch(es)...`);

    for (let c = 0; c < totalChunks; c++) {
      const chunk = groceryStock.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const itemRef = doc(db, 'users', uid, 'items', item.id);
        const payload = {
          id: item.id,
          name: item.name || '',
          price: item.price || '0.00',
          purchasePrice: item.purchasePrice || '0.00',
          stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : 0,
          unit: item.unit || 'PCS',
          category: item.category || 'General Grocery',
          defaultDiscount: item.defaultDiscount || '',
          updatedAt: item.updatedAt || Date.now(),
        };
        batch.set(itemRef, payload, { merge: true });
      }

      await batch.commit();
      seededCount += chunk.length;
      console.log(`  ✓ Batch ${c + 1}/${totalChunks}: Seeded ${chunk.length} items (Total: ${seededCount}/${groceryStock.length})`);
    }

    console.log('\n========================================================');
    console.log(`🎉 SUCCESS! Successfully seeded ${seededCount} items to Cloud Firestore.`);
    console.log(`Target Collection: users/${uid}/items`);
    console.log('Open FlashBill POS app or refresh to see your complete live inventory!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n❌ Seeding Error:', err.message || err);
    process.exit(1);
  }
}

seedGroceryStock();

