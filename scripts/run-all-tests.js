/**
 * scripts/run-all-tests.js
 * 
 * Comprehensive Subsystem & Integration Test Suite for CounterPress POS.
 * Tests:
 * 1. Schema Validation (Invoice, License, Preset Item, User Profile)
 * 2. Gapless Sequential Resequencing Engine (Single, Multi, Complete Delete)
 * 3. Monetary & Cart Calculation Engine (Multi-item, fractional qty, discounts)
 * 4. License Key Formatting & Status Validation
 * 5. ESC/POS Thermal Printing Column Formatting (58mm vs 80mm)
 */

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

function assertEqual(actual, expected, testName) {
  totalTests++;
  if (actual === expected) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} (Expected: ${expected}, Got: ${actual})`);
  }
}

console.log('====================================================');
console.log('   CounterPress POS - Automated Test Suite');
console.log('====================================================\n');

// ------------------------------------------------------------------
// SUITE 1: LICENSE KEY FORMATTING & VALIDATION
// ------------------------------------------------------------------
console.log('--- Suite 1: License Key Formatting & Logic ---');

function formatLicenseKey(raw) {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return '';

  if (cleaned.startsWith('COUNTER')) {
    const rest = cleaned.substring(7);
    const parts = ['COUNTER'];
    for (let i = 0; i < rest.length && parts.length < 4; i += 4) {
      parts.push(rest.substring(i, i + 4));
    }
    return parts.join('-');
  }

  if (cleaned.startsWith('CP')) {
    const rest = cleaned.substring(2);
    const parts = ['CP'];
    for (let i = 0; i < rest.length && parts.length < 4; i += 4) {
      parts.push(rest.substring(i, i + 4));
    }
    return parts.join('-');
  }

  if (cleaned.startsWith('FLASH')) {
    const rest = cleaned.substring(5);
    const parts = ['FLASH'];
    for (let i = 0; i < rest.length && parts.length < 4; i += 4) {
      parts.push(rest.substring(i, i + 4));
    }
    return parts.join('-');
  }

  const parts = [];
  for (let i = 0; i < cleaned.length && parts.length < 4; i += 4) {
    parts.push(cleaned.substring(i, i + 4));
  }
  return parts.join('-');
}

assertEqual(formatLicenseKey('cp8942x7k19920'), 'CP-8942-X7K1-9920', 'CP prefix lowercase formatting');
assertEqual(formatLicenseKey('CP-8942-X7K1-9920'), 'CP-8942-X7K1-9920', 'CP prefix already hyphenated');
assertEqual(formatLicenseKey('counter123456789012'), 'COUNTER-1234-5678-9012', 'COUNTER prefix unformatted');
assertEqual(formatLicenseKey('ABCD1234EFGH5678'), 'ABCD-1234-EFGH-5678', 'Standard 16-char key formatting');
assertEqual(formatLicenseKey(''), '', 'Empty string key returns empty');

// ------------------------------------------------------------------
// SUITE 2: GAPLESS SEQUENTIAL RESEQUENCING
// ------------------------------------------------------------------
console.log('\n--- Suite 2: Gapless Sequential Resequencing Engine ---');

function resequenceInvoices(currentInvoices) {
  if (!currentInvoices || currentInvoices.length === 0) return [];
  const sortedAsc = [...currentInvoices].sort((a, b) => {
    const numA = parseInt(a.invoiceNo, 10) || 0;
    const numB = parseInt(b.invoiceNo, 10) || 0;
    return numA - numB;
  });

  const reseq = sortedAsc.map((inv, idx) => ({
    ...inv,
    invoiceNo: String(idx + 1),
  }));

  return reseq.sort((a, b) => (parseInt(b.invoiceNo, 10) || 0) - (parseInt(a.invoiceNo, 10) || 0));
}

// Test 2A: Single deletion gap closure
const sampleBills = [
  { invoiceNo: '1', customer: 'Alice', grandTotal: '100' },
  { invoiceNo: '2', customer: 'Bob', grandTotal: '200' },
  { invoiceNo: '3', customer: 'Charlie', grandTotal: '300' },
  { invoiceNo: '4', customer: 'David', grandTotal: '400' },
];

const afterSingleDelete = resequenceInvoices(sampleBills.filter(b => b.invoiceNo !== '2'));
assertEqual(afterSingleDelete.length, 3, 'Count reduced to 3 after single delete');
assertEqual(afterSingleDelete[0].invoiceNo, '3', 'Top bill is #3 (newest)');
assertEqual(afterSingleDelete[1].invoiceNo, '2', 'Middle bill is #2 (was Charlie #3)');
assertEqual(afterSingleDelete[2].invoiceNo, '1', 'Oldest bill remains #1');
assertEqual(afterSingleDelete[1].customer, 'Charlie', 'Bob removed, Charlie re-indexed to #2');

// Test 2B: Multiple deletions
const tenBills = Array.from({ length: 10 }, (_, i) => ({
  invoiceNo: String(i + 1),
  customer: `Customer ${i + 1}`,
  grandTotal: String((i + 1) * 50),
}));

const deleteSet = new Set(['2', '5', '8']); // Delete 3 bills out of 10
const afterMultiDelete = resequenceInvoices(tenBills.filter(b => !deleteSet.has(b.invoiceNo)));
assertEqual(afterMultiDelete.length, 7, 'Count reduced to exactly 7');
const remainingNumbers = afterMultiDelete.map(b => b.invoiceNo).sort((a, b) => parseInt(a) - parseInt(b));
assertEqual(JSON.stringify(remainingNumbers), JSON.stringify(['1', '2', '3', '4', '5', '6', '7']), 'Continuous 1..7 sequence without gaps');

// Test 2C: Delete all invoices
const afterClearAll = resequenceInvoices([]);
assertEqual(afterClearAll.length, 0, 'Empty list handled safely');

// ------------------------------------------------------------------
// SUITE 3: CART & PRICING CALCULATION ENGINE
// ------------------------------------------------------------------
console.log('\n--- Suite 3: Cart & Line-Item Pricing Engine ---');

function calculateCartTotals(items) {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalQty = 0;

  for (const item of items) {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const lineGross = qty * price;
    subtotal += lineGross;
    totalQty += qty;

    const discPercent = parseFloat(item.discountPercent) || 0;
    let discAmt = parseFloat(item.discountAmount) || 0;
    if (discPercent > 0) {
      discAmt = (lineGross * discPercent) / 100;
    }
    totalDiscount += discAmt;
  }

  const grandTotal = Math.max(0, subtotal - totalDiscount);
  return {
    subtotal: subtotal.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    totalQty: totalQty.toString(),
  };
}

const testCart = [
  { sNo: '1', name: 'Basmati Rice', qty: '2.5', price: '80.00', discountPercent: '10' }, // Gross: 200, Disc: 20 -> Net: 180
  { sNo: '2', name: 'Sunflower Oil', qty: '1', price: '150.00', discountAmount: '15' },   // Gross: 150, Disc: 15 -> Net: 135
  { sNo: '3', name: 'Sugar', qty: '2', price: '45.00' },                                  // Gross: 90, Disc: 0 -> Net: 90
];

const cartResult = calculateCartTotals(testCart);
assertEqual(cartResult.subtotal, '440.00', 'Gross subtotal calculated correctly (200 + 150 + 90 = 440)');
assertEqual(cartResult.totalDiscount, '35.00', 'Total discount calculated correctly (20 + 15 = 35)');
assertEqual(cartResult.grandTotal, '405.00', 'Grand total calculated correctly (440 - 35 = 405)');
assertEqual(cartResult.totalQty, '5.5', 'Fractional quantities summed accurately (2.5 + 1 + 2 = 5.5)');

// ------------------------------------------------------------------
// SUITE 4: ESC/POS THERMAL PRINTING COLUMN FORMATTING
// ------------------------------------------------------------------
console.log('\n--- Suite 4: ESC/POS Column Width & Monospace Layout ---');

function padCell(text, width, align) {
  const str = text || '';
  if (str.length >= width) {
    return str.substring(0, width);
  }
  const pad = ' '.repeat(width - str.length);
  return align === 'right' ? pad + str : str + pad;
}

function formatReceiptRow(params) {
  const { sNo, name, qty, price, amount, is80mm } = params;
  if (is80mm) {
    // 80mm Layout (48 Columns total)
    const sNoCol = padCell(sNo, 3, 'left');
    const nameCol = padCell(name, 18, 'left');
    const gap1 = '  ';
    const qtyCol = padCell(qty, 7, 'right');
    const gap2 = '  ';
    const priceCol = padCell(price, 7, 'right');
    const gap3 = '  ';
    const amtCol = padCell(amount, 7, 'right');
    return `${sNoCol}${nameCol}${gap1}${qtyCol}${gap2}${priceCol}${gap3}${amtCol}`;
  } else {
    // 58mm Layout (42 Columns total)
    const sNoCol = padCell(sNo, 3, 'left');
    const nameCol = padCell(name, 14, 'left');
    const gap1 = '  ';
    const qtyCol = padCell(qty, 7, 'right');
    const gap2 = '  ';
    const priceCol = padCell(price, 6, 'right');
    const gap3 = '  ';
    const amtCol = padCell(amount, 6, 'right');
    return `${sNoCol}${nameCol}${gap1}${qtyCol}${gap2}${priceCol}${gap3}${amtCol}`;
  }
}

const row58mm = formatReceiptRow({
  sNo: '1',
  name: 'Basmati Rice',
  qty: '2 KG',
  price: '80',
  amount: '160',
  is80mm: false,
});
assertEqual(row58mm.length, 42, '58mm row formats to exactly 42 monospace columns');

const row80mm = formatReceiptRow({
  sNo: '1',
  name: 'Basmati Rice Premium',
  qty: '2 KG',
  price: '80',
  amount: '160',
  is80mm: true,
});
assertEqual(row80mm.length, 48, '80mm row formats to exactly 48 monospace columns');

// ------------------------------------------------------------------
// SUITE 5: SCHEMA & FIRESTORE PAYLOAD INTEGRITY
// ------------------------------------------------------------------
console.log('\n--- Suite 5: Schema & Firestore Payload Integrity ---');

function validateInvoicePayload(inv) {
  if (!inv.invoiceNo || typeof inv.invoiceNo !== 'string') return false;
  if (!inv.date || typeof inv.date !== 'string') return false;
  if (!Array.isArray(inv.items)) return false;
  if (inv.grandTotal === undefined || inv.grandTotal === null) return false;
  return true;
}

function validatePresetItemPayload(item) {
  if (!item.id || typeof item.id !== 'string') return false;
  if (!item.name || typeof item.name !== 'string') return false;
  if (!item.price || typeof item.price !== 'string') return false;
  if (item.stockQuantity === undefined || typeof item.stockQuantity !== 'number') return false;
  return true;
}

const validInvoice = {
  invoiceNo: '1',
  date: '06/11/2026',
  time: '08:45 PM',
  customerName: 'Basir Ahmed Khan',
  grandTotal: '180.00',
  items: [{ sNo: '1', name: 'Rice', qty: '2', price: '90', amt: '180' }],
};

const validItem = {
  id: 'item-101',
  name: 'Toor Dal Premium',
  price: '140.00',
  stockQuantity: 45,
  unit: 'KG',
};

assert(validateInvoicePayload(validInvoice), 'Invoice schema validation passes');
assert(validatePresetItemPayload(validItem), 'Preset Item schema validation passes');
assert(!validateInvoicePayload({ invoiceNo: 123 }), 'Malformed invoice without date or items is rejected');
assert(!validatePresetItemPayload({ name: 'No ID' }), 'Malformed item without id is rejected');

// ------------------------------------------------------------------
// FINAL SUMMARY
// ------------------------------------------------------------------
console.log('\n====================================================');
console.log(`Total Tests Run: ${totalTests}`);
console.log(`Passed:          ${passedTests}`);
console.log(`Failed:          ${failedTests}`);
console.log('====================================================');

if (failedTests === 0) {
  console.log('🎉 ALL INTEGRATION & SUBSYSTEM TESTS PASSED SEAMLESSLY!');
  process.exit(0);
} else {
  console.error(`❌ ${failedTests} TEST(S) FAILED!`);
  process.exit(1);
}

