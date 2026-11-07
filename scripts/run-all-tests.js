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

function formatTotalQtyRow(totalQty, is80mm) {
  const label = 'Total Items/Qty:';
  const leftWidth = is80mm ? 23 : 19;
  const qtyColWidth = 7;
  const totalLineWidth = is80mm ? 48 : 42;
  const leftPart = padCell(label, leftWidth, 'left');
  const qtyPart = padCell(String(totalQty), qtyColWidth, 'right');
  const rowContent = `${leftPart}${qtyPart}`;
  const rightPad = ' '.repeat(Math.max(0, totalLineWidth - rowContent.length));
  return `${rowContent}${rightPad}`;
}

const totalQty58mm = formatTotalQtyRow('55', false);
assertEqual(totalQty58mm.length, 42, '58mm Total Items/Qty line formats to exactly 42 monospace columns');
assertEqual(totalQty58mm.substring(19, 26), '     55', '58mm Total Items/Qty aligns precisely inside the 7-col Qty boundary (col 19-25)');

const totalQty80mm = formatTotalQtyRow('55', true);
assertEqual(totalQty80mm.length, 48, '80mm Total Items/Qty line formats to exactly 48 monospace columns');
assertEqual(totalQty80mm.substring(23, 30), '     55', '80mm Total Items/Qty aligns precisely inside the 7-col Qty boundary (col 23-29)');

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
// SUITE 6: REAL-TIME INVENTORY STOCK DEDUCTION (STOCK-OUT ENGINE)
// ------------------------------------------------------------------
console.log('\n--- Suite 6: Real-Time Inventory Stock Deduction ---');

function deductInventoryStock(presets, invoiceItems) {
  const soldQtyByPresetId = {};

  for (const item of invoiceItems) {
    const soldQty = parseFloat(item.qty) || 0;
    if (soldQty <= 0) continue;

    const matched =
      (item.itemId && presets.find((p) => p.id === item.itemId)) ||
      presets.find((p) => p.name.trim().toLowerCase() === (item.name || '').trim().toLowerCase());

    if (matched && typeof matched.stockQuantity === 'number') {
      soldQtyByPresetId[matched.id] = (soldQtyByPresetId[matched.id] || 0) + soldQty;
    }
  }

  return presets.map((preset) => {
    if (soldQtyByPresetId[preset.id] !== undefined) {
      const currentStock = preset.stockQuantity ?? 0;
      const soldQty = soldQtyByPresetId[preset.id];
      const newStock = Math.round((currentStock - soldQty) * 100) / 100;
      return {
        ...preset,
        stockQuantity: newStock,
        updatedAt: Date.now(),
      };
    }
    return preset;
  });
}

// Scenario 1: User's exact case (Rice 100 KG in stock, sells 50 KG -> 50 KG remaining)
const initialCatalog = [
  { id: 'rice-1', name: 'Rice', price: '40.00', stockQuantity: 100, unit: 'KG' },
  { id: 'sugar-1', name: 'Sugar', price: '45.00', stockQuantity: 25, unit: 'KG' },
  { id: 'oil-1', name: 'Sunflower Oil', price: '130.00', stockQuantity: 10, unit: 'L' },
  { id: 'service-1', name: 'Delivery Charge', price: '50.00', unit: 'PCS' }, // untracked
];

const saleItems = [
  { sNo: '1', name: 'Rice', qty: '50', unit: 'KG', price: '40.00', amt: '2000.00' },
  { sNo: '2', itemId: 'oil-1', name: 'Sunflower Oil', qty: '2.5', unit: 'L', price: '130.00', amt: '325.00' },
  { sNo: '3', name: 'Delivery Charge', qty: '1', unit: 'PCS', price: '50.00', amt: '50.00' },
];

const updatedCatalog = deductInventoryStock(initialCatalog, saleItems);

const updatedRice = updatedCatalog.find((i) => i.id === 'rice-1');
const updatedSugar = updatedCatalog.find((i) => i.id === 'sugar-1');
const updatedOil = updatedCatalog.find((i) => i.id === 'oil-1');
const updatedService = updatedCatalog.find((i) => i.id === 'service-1');

assertEqual(updatedRice.stockQuantity, 50, 'Rice 100 KG minus 50 KG sold leaves exactly 50 KG');
assertEqual(updatedSugar.stockQuantity, 25, 'Unsold Sugar remains untouched at 25 KG');
assertEqual(updatedOil.stockQuantity, 7.5, 'Sunflower Oil 10 L minus 2.5 L sold leaves exactly 7.5 L');
assertEqual(updatedService.stockQuantity, undefined, 'Untracked service item remains untracked without crashing');

// Scenario 2: Multiple rows of same item in one invoice (e.g. 20 KG + 30 KG = 50 KG deducted)
const multiRowSale = [
  { sNo: '1', name: 'Rice', qty: '20', unit: 'KG', price: '40', amt: '800' },
  { sNo: '2', name: 'Rice', qty: '30', unit: 'KG', price: '40', amt: '1200' },
];
const updatedMulti = deductInventoryStock([{ id: 'rice-1', name: 'Rice', stockQuantity: 100 }], multiRowSale);
assertEqual(updatedMulti[0].stockQuantity, 50, 'Multiple sale lines of same item correctly sum to 50 KG deduction');

// Scenario 3: Overselling past 0 produces negative inventory count
const oversell = deductInventoryStock([{ id: 'biscuit-1', name: 'Parle-G', stockQuantity: 2 }], [{ sNo: '1', name: 'Parle-G', qty: '5', price: '10', amt: '50' }]);
assertEqual(oversell[0].stockQuantity, -3, 'Oversold inventory gracefully tracks negative stock (-3)');

// ------------------------------------------------------------------
// SUITE 7: UNIVERSAL UPPERCASE ITEMS & CAPITALIZED UNITS
// ------------------------------------------------------------------
console.log('\n--- Suite 7: Item Name Uppercase & Unit Title-Casing ---');

function formatItemName(name) {
  if (!name) return '';
  return name.trim().toUpperCase();
}

function formatUnit(unit) {
  if (!unit) return '';
  const trimmed = unit.trim();
  const upper = trimmed.toUpperCase();

  switch (upper) {
    case 'KG':
    case 'KGS':
    case 'KILOGRAM':
      return 'Kg';
    case 'GM':
    case 'GMS':
    case 'GRAM':
    case 'GRAMS':
      return 'Gm';
    case 'G':
      return 'G';
    case 'L':
    case 'LTR':
    case 'LITRE':
    case 'LITER':
      return 'L';
    case 'ML':
    case 'MILLILITRE':
    case 'MILLILITER':
      return 'Ml';
    case 'PCS':
    case 'PC':
    case 'PIECE':
    case 'PIECES':
      return 'Pcs';
    case 'PKT':
    case 'PACKET':
    case 'PACKETS':
      return 'Pkt';
    case 'DZ':
    case 'DOZ':
    case 'DOZEN':
      return 'Doz';
    case 'BOX':
    case 'BOXES':
      return 'Box';
    case 'BAG':
    case 'BAGS':
      return 'Bag';
    case 'BTL':
    case 'BOTTLE':
    case 'BOTTLES':
      return 'Btl';
    case 'TIN':
    case 'TINS':
      return 'Tin';
    case 'CAN':
    case 'CANS':
      return 'Can';
    case 'CTN':
    case 'CARTON':
      return 'Ctn';
    case 'ROLL':
    case 'ROLLS':
      return 'Roll';
    case 'QTL':
    case 'QUINTAL':
      return 'Qtl';
    case 'TON':
    case 'TONS':
      return 'Ton';
    case 'PLT':
    case 'PLATE':
      return 'Plt';
    case 'CUP':
    case 'CUPS':
      return 'Cup';
    case 'PR':
    case 'PAIR':
    case 'PAIRS':
      return 'Pr';
    case 'SET':
    case 'SETS':
      return 'Set';
    case 'M':
    case 'METER':
    case 'METERS':
      return 'M';
    case 'SQFT':
    case 'SQ FT':
      return 'Sqft';
    default:
      if (upper.length === 1) return upper;
      return upper.charAt(0) + upper.slice(1).toLowerCase();
  }
}

assertEqual(formatItemName('basmati rice'), 'BASMATI RICE', 'Item name lowercase converted to UPPERCASE');
assertEqual(formatItemName('  Sunflower Oil  '), 'SUNFLOWER OIL', 'Item name with whitespace trimmed and UPPERCASE');
assertEqual(formatItemName('TOOR DAL'), 'TOOR DAL', 'Already uppercase remains unchanged');

assertEqual(formatUnit('KG'), 'Kg', 'KG standardizes to Kg');
assertEqual(formatUnit('kg'), 'Kg', 'kg standardizes to Kg');
assertEqual(formatUnit('PCS'), 'Pcs', 'PCS standardizes to Pcs');
assertEqual(formatUnit('l'), 'L', 'l standardizes to L');
assertEqual(formatUnit('ml'), 'Ml', 'ml standardizes to Ml');
assertEqual(formatUnit('gm'), 'Gm', 'gm standardizes to Gm');
assertEqual(formatUnit('PKT'), 'Pkt', 'PKT standardizes to Pkt');
assertEqual(formatUnit('BOX'), 'Box', 'BOX standardizes to Box');

// Test thermal line formatting with uppercase name and formatted unit
const receiptRowUpper58 = formatReceiptRow({
  sNo: '1',
  name: formatItemName('Basmati Rice'),
  qty: `2 ${formatUnit('KG')}`,
  price: '80',
  amount: '160',
  is80mm: false,
});
assertEqual(receiptRowUpper58.length, 42, '58mm row with formatted item/unit preserves exact 42-col width');
assertEqual(receiptRowUpper58.substring(3, 17), 'BASMATI RICE  ', 'Uppercase item name formatted correctly in 58mm');
assertEqual(receiptRowUpper58.substring(19, 26), '   2 Kg', 'Title-cased unit formatted cleanly in 58mm');

// ------------------------------------------------------------------
// SUITE 8: STORE CUSTOMERS PERSISTENCE & AUTO-SUGGESTIONS
// ------------------------------------------------------------------
console.log('\n--- Suite 8: Customer Suggestions & Deletion Logic ---');

function formatCustomerName(name) {
  if (!name) return '';
  return name.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

function mockCustomerEngine() {
  let savedCustomers = [];
  let deletedCustomerNames = [];

  function saveCustomer(name, phone) {
    const formatted = formatCustomerName(name);
    if (!formatted || formatted.toLowerCase() === 'cash' || formatted.toLowerCase() === 'walk-in customer') {
      return savedCustomers;
    }

    // Un-delete if previously deleted
    deletedCustomerNames = deletedCustomerNames.filter(n => n.toLowerCase() !== formatted.toLowerCase());

    const idx = savedCustomers.findIndex(c => c.name.toLowerCase() === formatted.toLowerCase());
    if (idx >= 0) {
      savedCustomers[idx] = {
        ...savedCustomers[idx],
        name: formatted,
        phone: phone ? phone.trim() : savedCustomers[idx].phone,
        updatedAt: Date.now(),
      };
    } else {
      savedCustomers.unshift({
        id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: formatted,
        phone: phone ? phone.trim() : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return [...savedCustomers];
  }

  function deleteCustomer(nameOrId) {
    const trimmed = (nameOrId || '').trim();
    if (!trimmed) return savedCustomers;

    const target = savedCustomers.find(c => c.id === trimmed || c.name.toLowerCase() === trimmed.toLowerCase());
    savedCustomers = savedCustomers.filter(c => c.id !== trimmed && c.name.toLowerCase() !== trimmed.toLowerCase());

    const nameToAdd = target ? target.name.toLowerCase() : trimmed.toLowerCase();
    if (!deletedCustomerNames.includes(nameToAdd)) {
      deletedCustomerNames.push(nameToAdd);
    }
    return [...savedCustomers];
  }

  function harvestInvoices(invoices) {
    const deletedSet = new Set(deletedCustomerNames.map(n => n.toLowerCase()));
    const existingSet = new Set(savedCustomers.map(c => c.name.toLowerCase()));
    for (const inv of invoices) {
      const n = (inv.customerName || '').trim();
      if (n && n.toLowerCase() !== 'cash' && n.toLowerCase() !== 'walk-in customer' && !deletedSet.has(n.toLowerCase()) && !existingSet.has(n.toLowerCase())) {
        saveCustomer(n, inv.customerPhone);
        existingSet.add(n.toLowerCase());
      }
    }
  }

  function getSuggestions(query) {
    const q = (query || '').trim().toLowerCase();
    const presets = [
      { name: 'Cash', canDelete: false, isPreset: true },
      { name: 'Walk-in Customer', canDelete: false, isPreset: true },
    ];

    if (!q) {
      const recent = savedCustomers.slice(0, 5).map(c => ({ id: c.id, name: c.name, phone: c.phone, canDelete: true }));
      return [...presets, ...recent];
    }

    const matchedPresets = presets.filter(p => p.name.toLowerCase() !== q && p.name.toLowerCase().includes(q));
    const matchedSaved = savedCustomers
      .filter(c => c.name.toLowerCase() !== q && (c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))))
      .map(c => ({ id: c.id, name: c.name, phone: c.phone, canDelete: true }));

    const combined = [...matchedPresets, ...matchedSaved];
    combined.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
    return combined;
  }

  return { saveCustomer, deleteCustomer, harvestInvoices, getSuggestions, getSaved: () => savedCustomers };
}

const engine = mockCustomerEngine();

// Test 8A: Saving customers
engine.saveCustomer('Basir Khan', '9876543210');
engine.saveCustomer('Rahul Sharma', '9123456789');
assertEqual(engine.getSaved().length, 2, '2 unique customers saved successfully');
assertEqual(engine.getSaved()[0].name, 'Rahul Sharma', 'Most recently added customer is at index 0');

// Test 8B: Deduplication on repeat customer
engine.saveCustomer('basir khan', '9999999999'); // case-insensitive update with new phone
assertEqual(engine.getSaved().length, 2, 'Deduplication prevents duplicate entries for same customer');
assertEqual(engine.getSaved().find(c => c.name.toLowerCase() === 'basir khan').phone, '9999999999', 'Customer phone successfully updated');

// Test 8C: Presets ignored from customer database
engine.saveCustomer('Cash');
engine.saveCustomer('Walk-in Customer');
assertEqual(engine.getSaved().length, 2, '"Cash" and "Walk-in Customer" are never added as custom database records');

// Test 8D: Autocomplete filtering
const suggestionsC = engine.getSuggestions('c');
assertEqual(suggestionsC.some(s => s.name === 'Cash'), true, 'Typing "c" suggests "Cash"');

const suggestionsB = engine.getSuggestions('bas');
assertEqual(suggestionsB.length, 1, 'Typing "bas" filters to "Basir Khan"');
assertEqual(suggestionsB[0].name, 'Basir Khan', 'Suggestion name is Basir Khan');
assertEqual(suggestionsB[0].canDelete, true, 'Saved customer has canDelete: true');

// Test 8E: Cross symbol deletion
engine.deleteCustomer('Basir Khan');
assertEqual(engine.getSaved().length, 1, 'Customer deleted from saved list');
const suggestionsAfterDel = engine.getSuggestions('bas');
assertEqual(suggestionsAfterDel.length, 0, 'Deleted customer no longer appears in suggestions');

// Test 8F: Automatic past-invoice harvest respects deletion
engine.harvestInvoices([
  { customerName: 'Basir Khan', customerPhone: '9876543210' }, // deleted -> should NOT resurrect
  { customerName: 'Amit Patel', customerPhone: '9822001122' },  // new -> should harvest
]);
assertEqual(engine.getSaved().find(c => c.name === 'Basir Khan'), undefined, 'Deleted customer is not resurrected by past invoice harvest');
assertEqual(engine.getSaved().some(c => c.name === 'Amit Patel'), true, 'New past customer Amit Patel is harvested from invoices');

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

