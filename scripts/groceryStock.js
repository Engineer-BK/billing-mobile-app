/**
 * scripts/groceryStock.js
 * 
 * Cleaned & Normalized Inventory Stock Catalog for FlashBill POS.
 * Conforms 1-to-1 with the PresetItem schema (types/item.ts) for Cloud Firestore.
 * 
 * Generated from Store Manager PDF: Stock_Summary_Report_03-11-2026.pdf
 * Total Valid Items: 341 (Filtered out 9 zero-price OCR/dummy artifacts)
 * 
 * Exports:
 *  - groceryStock (Cleaned PresetItem[])
 *  - rawGroceryStock (Original 350 raw items for historical audit)
 *  - reportMeta (Summary metadata)
 */

const groceryStock = [
  {
    "id": "item_stock_1",
    "name": "Parle 20-20 Biscuit",
    "price": "360.00",
    "purchasePrice": "350.00",
    "stockQuantity": -2,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700000000
  },
  {
    "id": "item_stock_2",
    "name": "Achar",
    "price": "8.50",
    "purchasePrice": "7.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700001000
  },
  {
    "id": "item_stock_3",
    "name": "Achar 200 GM",
    "price": "35.00",
    "purchasePrice": "32.50",
    "stockQuantity": -21,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700002000
  },
  {
    "id": "item_stock_4",
    "name": "Achar 5 KG",
    "price": "200.00",
    "purchasePrice": "180.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700003000
  },
  {
    "id": "item_stock_5",
    "name": "Ad Soap-7pce",
    "price": "55.00",
    "purchasePrice": "50.00",
    "stockQuantity": -4,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700004000
  },
  {
    "id": "item_stock_6",
    "name": "Ajwin",
    "price": "260.00",
    "purchasePrice": "250.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700005000
  },
  {
    "id": "item_stock_7",
    "name": "Alpen Gold Chocolate",
    "price": "185.00",
    "purchasePrice": "177.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700006000
  },
  {
    "id": "item_stock_8",
    "name": "Amla",
    "price": "19.00",
    "purchasePrice": "18.50",
    "stockQuantity": -12,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700007000
  },
  {
    "id": "item_stock_9",
    "name": "Amla Hair Oil",
    "price": "99.00",
    "purchasePrice": "95.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700008000
  },
  {
    "id": "item_stock_10",
    "name": "Amla Hair Oil",
    "price": "47.00",
    "purchasePrice": "45.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700009000
  },
  {
    "id": "item_stock_11",
    "name": "Amul",
    "price": "110.00",
    "purchasePrice": "108.00",
    "stockQuantity": -21,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700010000
  },
  {
    "id": "item_stock_12",
    "name": "Amul 100 GM",
    "price": "46.50",
    "purchasePrice": "45.00",
    "stockQuantity": -5,
    "unit": "GM",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700011000
  },
  {
    "id": "item_stock_13",
    "name": "Amul 500 GM Dabba",
    "price": "240.00",
    "purchasePrice": "235.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700012000
  },
  {
    "id": "item_stock_14",
    "name": "Amul-1 KG",
    "price": "450.00",
    "purchasePrice": "430.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700013000
  },
  {
    "id": "item_stock_15",
    "name": "Amul",
    "price": "10.00",
    "purchasePrice": "9.50",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700014000
  },
  {
    "id": "item_stock_16",
    "name": "Amulya 10 KG JAR",
    "price": "3975.00",
    "purchasePrice": "3900.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700015000
  },
  {
    "id": "item_stock_17",
    "name": "Amulya",
    "price": "400.00",
    "purchasePrice": "390.00",
    "stockQuantity": -1.5,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700016000
  },
  {
    "id": "item_stock_18",
    "name": "Sharbat",
    "price": "160.00",
    "purchasePrice": "140.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700017000
  },
  {
    "id": "item_stock_19",
    "name": "Arham Rice",
    "price": "64.50",
    "purchasePrice": "63.75",
    "stockQuantity": -52,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700018000
  },
  {
    "id": "item_stock_20",
    "name": "Arhar Dal",
    "price": "105.00",
    "purchasePrice": "98.00",
    "stockQuantity": -7,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700019000
  },
  {
    "id": "item_stock_21",
    "name": "Arjuna",
    "price": "370.00",
    "purchasePrice": "355.00",
    "stockQuantity": -7,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700020000
  },
  {
    "id": "item_stock_22",
    "name": "Sabut Jeera 1 KG",
    "price": "280.00",
    "purchasePrice": "250.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700021000
  },
  {
    "id": "item_stock_23",
    "name": "Sabut Dhania",
    "price": "200.00",
    "purchasePrice": "190.00",
    "stockQuantity": -3,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700022000
  },
  {
    "id": "item_stock_24",
    "name": "Sabut Garam Masala",
    "price": "100.00",
    "purchasePrice": "90.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700023000
  },
  {
    "id": "item_stock_25",
    "name": "Sabut Jeera",
    "price": "420.00",
    "purchasePrice": "390.00",
    "stockQuantity": -0.5,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700024000
  },
  {
    "id": "item_stock_26",
    "name": "Sabut Lal Mirch",
    "price": "185.00",
    "purchasePrice": "170.00",
    "stockQuantity": -1.35,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700025000
  },
  {
    "id": "item_stock_27",
    "name": "Sabut Moong",
    "price": "120.00",
    "purchasePrice": "105.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700026000
  },
  {
    "id": "item_stock_28",
    "name": "Atta",
    "price": "1895.00",
    "purchasePrice": "1867.00",
    "stockQuantity": -2,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700027000
  },
  {
    "id": "item_stock_29",
    "name": "Atta",
    "price": "38.00",
    "purchasePrice": "35.00",
    "stockQuantity": -33,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700028000
  },
  {
    "id": "item_stock_30",
    "name": "Atta 1 KG Pack",
    "price": "50.00",
    "purchasePrice": "41.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700029000
  },
  {
    "id": "item_stock_31",
    "name": "Amulya",
    "price": "3900.00",
    "purchasePrice": "3850.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700030000
  },
  {
    "id": "item_stock_32",
    "name": "Kacha Badam (Peanuts)",
    "price": "155.00",
    "purchasePrice": "145.00",
    "stockQuantity": -1.5,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700031000
  },
  {
    "id": "item_stock_33",
    "name": "Bag",
    "price": "8.00",
    "purchasePrice": "5.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700032000
  },
  {
    "id": "item_stock_34",
    "name": "Bag",
    "price": "17.00",
    "purchasePrice": "15.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700033000
  },
  {
    "id": "item_stock_35",
    "name": "Bag",
    "price": "26.00",
    "purchasePrice": "24.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700034000
  },
  {
    "id": "item_stock_36",
    "name": "Bajaj Oil",
    "price": "44.00",
    "purchasePrice": "0.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700035000
  },
  {
    "id": "item_stock_37",
    "name": "Baking Powder",
    "price": "80.00",
    "purchasePrice": "70.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700036000
  },
  {
    "id": "item_stock_38",
    "name": "Boro Bakhar",
    "price": "8.00",
    "purchasePrice": "7.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700037000
  },
  {
    "id": "item_stock_39",
    "name": "Boro Bakhar-100 GM",
    "price": "260.00",
    "purchasePrice": "230.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700038000
  },
  {
    "id": "item_stock_40",
    "name": "Boro Bakhar-200 GM",
    "price": "260.00",
    "purchasePrice": "260.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700039000
  },
  {
    "id": "item_stock_41",
    "name": "Boro Bakhar-40pcs",
    "price": "270.00",
    "purchasePrice": "230.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700040000
  },
  {
    "id": "item_stock_42",
    "name": "Agarbatti",
    "price": "75.00",
    "purchasePrice": "65.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700041000
  },
  {
    "id": "item_stock_43",
    "name": "Besan Loose",
    "price": "75.00",
    "purchasePrice": "70.00",
    "stockQuantity": -6,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700042000
  },
  {
    "id": "item_stock_44",
    "name": "Besan Pack",
    "price": "140.00",
    "purchasePrice": "1250.00",
    "stockQuantity": -1,
    "unit": "PKT",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700043000
  },
  {
    "id": "item_stock_45",
    "name": "Best Choice Refined Oil 1 L,pouch",
    "price": "125.00",
    "purchasePrice": "120.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700044000
  },
  {
    "id": "item_stock_46",
    "name": "Bhujia-700 GM",
    "price": "65.00",
    "purchasePrice": "60.00",
    "stockQuantity": -8,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700045000
  },
  {
    "id": "item_stock_47",
    "name": "Biryani Rice 1 KG",
    "price": "160.00",
    "purchasePrice": "135.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700046000
  },
  {
    "id": "item_stock_48",
    "name": "Britannia Thin Arrowroot Biscuit",
    "price": "540.00",
    "purchasePrice": "525.00",
    "stockQuantity": -8,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700047000
  },
  {
    "id": "item_stock_49",
    "name": "Britannia Good Day Biscuit",
    "price": "36.00",
    "purchasePrice": "34.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700048000
  },
  {
    "id": "item_stock_50",
    "name": "Britannia Marie Gold Biscuit",
    "price": "36.00",
    "purchasePrice": "34.00",
    "stockQuantity": -5,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700049000
  },
  {
    "id": "item_stock_51",
    "name": "Britannia Thin Arrowroot Biscuit",
    "price": "36.00",
    "purchasePrice": "33.50",
    "stockQuantity": -8,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700050000
  },
  {
    "id": "item_stock_52",
    "name": "Britannia Cream Biscuit",
    "price": "55.00",
    "purchasePrice": "52.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700051000
  },
  {
    "id": "item_stock_53",
    "name": "Britannia Nutrichoice Cracker",
    "price": "46.00",
    "purchasePrice": "42.00",
    "stockQuantity": -14,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700052000
  },
  {
    "id": "item_stock_54",
    "name": "Britannia Marie Gold Biscuit",
    "price": "22.50",
    "purchasePrice": "22.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700053000
  },
  {
    "id": "item_stock_55",
    "name": "Britannia Toast",
    "price": "32.00",
    "purchasePrice": "35.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700054000
  },
  {
    "id": "item_stock_56",
    "name": "Britannia Thin Arrowroot Biscuit",
    "price": "55.00",
    "purchasePrice": "53.00",
    "stockQuantity": -2,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700055000
  },
  {
    "id": "item_stock_57",
    "name": "Britannia Thin Arrowroot Biscuit",
    "price": "720.00",
    "purchasePrice": "700.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700056000
  },
  {
    "id": "item_stock_58",
    "name": "Britannia Marie Gold Biscuit",
    "price": "430.00",
    "purchasePrice": "410.00",
    "stockQuantity": -2,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700057000
  },
  {
    "id": "item_stock_59",
    "name": "Britannia Marie Gold Biscuit",
    "price": "9.00",
    "purchasePrice": "8.50",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700058000
  },
  {
    "id": "item_stock_60",
    "name": "Britannia Golmaal Biscuit",
    "price": "26.50",
    "purchasePrice": "24.50",
    "stockQuantity": -10,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700059000
  },
  {
    "id": "item_stock_61",
    "name": "Cake",
    "price": "4.35",
    "purchasePrice": "4.25",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700060000
  },
  {
    "id": "item_stock_62",
    "name": "Camel Food Color",
    "price": "8.00",
    "purchasePrice": "6.50",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700061000
  },
  {
    "id": "item_stock_63",
    "name": "Candle",
    "price": "8.00",
    "purchasePrice": "7.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700062000
  },
  {
    "id": "item_stock_64",
    "name": "Candle",
    "price": "24.00",
    "purchasePrice": "20.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700063000
  },
  {
    "id": "item_stock_65",
    "name": "Candle",
    "price": "4.00",
    "purchasePrice": "3.50",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700064000
  },
  {
    "id": "item_stock_66",
    "name": "Cream Biscuit",
    "price": "50.00",
    "purchasePrice": "45.00",
    "stockQuantity": -12,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700065000
  },
  {
    "id": "item_stock_67",
    "name": "Catch Black Salt",
    "price": "45.00",
    "purchasePrice": "42.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700066000
  },
  {
    "id": "item_stock_68",
    "name": "Cello Graipper-Pen",
    "price": "7.50",
    "purchasePrice": "6.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700067000
  },
  {
    "id": "item_stock_69",
    "name": "Center Fresh",
    "price": "200.00",
    "purchasePrice": "192.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700068000
  },
  {
    "id": "item_stock_70",
    "name": "Center Frut",
    "price": "185.00",
    "purchasePrice": "180.00",
    "stockQuantity": -3,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700069000
  },
  {
    "id": "item_stock_71",
    "name": "Chaaria Fol",
    "price": "150.00",
    "purchasePrice": "140.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700070000
  },
  {
    "id": "item_stock_72",
    "name": "Spoon (Chamach)",
    "price": "40.00",
    "purchasePrice": "35.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700071000
  },
  {
    "id": "item_stock_73",
    "name": "Bhuna Chana",
    "price": "130.00",
    "purchasePrice": "120.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700072000
  },
  {
    "id": "item_stock_74",
    "name": "Chana Dal",
    "price": "85.00",
    "purchasePrice": "80.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700073000
  },
  {
    "id": "item_stock_75",
    "name": "Chana",
    "price": "89.00",
    "purchasePrice": "86.75",
    "stockQuantity": -31.5,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700074000
  },
  {
    "id": "item_stock_76",
    "name": "Chapor",
    "price": "1230.00",
    "purchasePrice": "1200.00",
    "stockQuantity": -13,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700075000
  },
  {
    "id": "item_stock_77",
    "name": "Chips Bundle",
    "price": "80.00",
    "purchasePrice": "78.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700076000
  },
  {
    "id": "item_stock_78",
    "name": "Chips",
    "price": "4.30",
    "purchasePrice": "4.25",
    "stockQuantity": -585,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700077000
  },
  {
    "id": "item_stock_79",
    "name": "Chips-24pce",
    "price": "80.00",
    "purchasePrice": "75.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700078000
  },
  {
    "id": "item_stock_80",
    "name": "Chira (Poha)",
    "price": "45.00",
    "purchasePrice": "41.00",
    "stockQuantity": -8,
    "unit": "PCS",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700079000
  },
  {
    "id": "item_stock_81",
    "name": "Chuna Loose",
    "price": "35.00",
    "purchasePrice": "30.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700080000
  },
  {
    "id": "item_stock_82",
    "name": "Chuna Lq",
    "price": "8.00",
    "purchasePrice": "7.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700081000
  },
  {
    "id": "item_stock_83",
    "name": "Chuna-9 KG",
    "price": "275.00",
    "purchasePrice": "260.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700082000
  },
  {
    "id": "item_stock_84",
    "name": "Clear Hair Oil-73",
    "price": "69.00",
    "purchasePrice": "66.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700083000
  },
  {
    "id": "item_stock_85",
    "name": "Coconut",
    "price": "9.00",
    "purchasePrice": "8.50",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700084000
  },
  {
    "id": "item_stock_86",
    "name": "Coconut Oil",
    "price": "18.00",
    "purchasePrice": "17.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700085000
  },
  {
    "id": "item_stock_87",
    "name": "Coffee Cup 100 ML",
    "price": "45.00",
    "purchasePrice": "40.00",
    "stockQuantity": -5,
    "unit": "ML",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700086000
  },
  {
    "id": "item_stock_88",
    "name": "Coffee Cup 60-50 ML",
    "price": "32.50",
    "purchasePrice": "30.00",
    "stockQuantity": -2,
    "unit": "ML",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700087000
  },
  {
    "id": "item_stock_89",
    "name": "Colgate",
    "price": "108.00",
    "purchasePrice": "108.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700088000
  },
  {
    "id": "item_stock_90",
    "name": "Colgate",
    "price": "216.00",
    "purchasePrice": "210.00",
    "stockQuantity": -4,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700089000
  },
  {
    "id": "item_stock_91",
    "name": "Corn Flakes",
    "price": "54.00",
    "purchasePrice": "50.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700090000
  },
  {
    "id": "item_stock_92",
    "name": "Dabur Lal",
    "price": "9.25",
    "purchasePrice": "8.50",
    "stockQuantity": -24,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700091000
  },
  {
    "id": "item_stock_93",
    "name": "Dabur Amla 53",
    "price": "49.00",
    "purchasePrice": "47.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700092000
  },
  {
    "id": "item_stock_94",
    "name": "Dabur Special Oil",
    "price": "52.00",
    "purchasePrice": "48.00",
    "stockQuantity": -5,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700093000
  },
  {
    "id": "item_stock_95",
    "name": "Dald. 100 GM",
    "price": "16.00",
    "purchasePrice": "12.50",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700094000
  },
  {
    "id": "item_stock_96",
    "name": "Dalda",
    "price": "130.00",
    "purchasePrice": "120.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700095000
  },
  {
    "id": "item_stock_97",
    "name": "Dalda15 KG",
    "price": "2325.00",
    "purchasePrice": "2280.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700096000
  },
  {
    "id": "item_stock_98",
    "name": "Dalmut 1no",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": -11,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700097000
  },
  {
    "id": "item_stock_99",
    "name": "Dalmut 700 GM",
    "price": "65.00",
    "purchasePrice": "60.00",
    "stockQuantity": -13,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700098000
  },
  {
    "id": "item_stock_100",
    "name": "Delight Achar",
    "price": "65.00",
    "purchasePrice": "62.00",
    "stockQuantity": -9,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700099000
  },
  {
    "id": "item_stock_101",
    "name": "Dettol Soap",
    "price": "9.25",
    "purchasePrice": "9.00",
    "stockQuantity": -102,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700100000
  },
  {
    "id": "item_stock_102",
    "name": "Dhoop Agarbatti",
    "price": "200.00",
    "purchasePrice": "190.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700101000
  },
  {
    "id": "item_stock_103",
    "name": "Dhuna",
    "price": "140.00",
    "purchasePrice": "130.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700102000
  },
  {
    "id": "item_stock_104",
    "name": "Diamond Chips",
    "price": "4.30",
    "purchasePrice": "4.20",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700103000
  },
  {
    "id": "item_stock_105",
    "name": "Eggs Tray (210 PCS)",
    "price": "1450.00",
    "purchasePrice": "1400.00",
    "stockQuantity": -8,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700104000
  },
  {
    "id": "item_stock_106",
    "name": "Eggs Plate (30 PCS)",
    "price": "215.00",
    "purchasePrice": "200.00",
    "stockQuantity": -14,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700105000
  },
  {
    "id": "item_stock_107",
    "name": "Engine Mustard Oil 5 L",
    "price": "1150.00",
    "purchasePrice": "1120.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700106000
  },
  {
    "id": "item_stock_108",
    "name": "Engine 100 ML",
    "price": "28.00",
    "purchasePrice": "27.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700107000
  },
  {
    "id": "item_stock_109",
    "name": "Engine Mustard Oil 1 L",
    "price": "229.00",
    "purchasePrice": "224.50",
    "stockQuantity": -28,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700108000
  },
  {
    "id": "item_stock_110",
    "name": "Engine Mustard Oil .200 ML",
    "price": "54.00",
    "purchasePrice": "51.00",
    "stockQuantity": -21,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700109000
  },
  {
    "id": "item_stock_111",
    "name": "Engine Mustard Oil 500 ML",
    "price": "119.00",
    "purchasePrice": "114.50",
    "stockQuantity": -86,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700110000
  },
  {
    "id": "item_stock_112",
    "name": "Engine Mustard Oil 50 ML",
    "price": "18.50",
    "purchasePrice": "18.00",
    "stockQuantity": -18,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700111000
  },
  {
    "id": "item_stock_113",
    "name": "Engine Top Refined Oil 1 L",
    "price": "165.00",
    "purchasePrice": "155.00",
    "stockQuantity": -10,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700112000
  },
  {
    "id": "item_stock_114",
    "name": "Everyday Amul Milk Powder",
    "price": "110.00",
    "purchasePrice": "107.00",
    "stockQuantity": -13,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700113000
  },
  {
    "id": "item_stock_115",
    "name": "Everyday Amul Milk Powder 100 GM",
    "price": "66.00",
    "purchasePrice": "63.50",
    "stockQuantity": -15,
    "unit": "GM",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700114000
  },
  {
    "id": "item_stock_116",
    "name": "Everyday Amul Milk Powder 200 GM",
    "price": "125.00",
    "purchasePrice": "120.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700115000
  },
  {
    "id": "item_stock_117",
    "name": "Eveready Battery",
    "price": "125.00",
    "purchasePrice": "115.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700116000
  },
  {
    "id": "item_stock_118",
    "name": "Fair & Lovely",
    "price": "220.00",
    "purchasePrice": "210.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700117000
  },
  {
    "id": "item_stock_119",
    "name": "Fair & Lovely",
    "price": "66.00",
    "purchasePrice": "64.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700118000
  },
  {
    "id": "item_stock_120",
    "name": "Fevikwik",
    "price": "100.00",
    "purchasePrice": "92.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700119000
  },
  {
    "id": "item_stock_121",
    "name": "Finger Snacks",
    "price": "70.00",
    "purchasePrice": "65.00",
    "stockQuantity": -0.25,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700120000
  },
  {
    "id": "item_stock_122",
    "name": "Flake",
    "price": "83.00",
    "purchasePrice": "81.00",
    "stockQuantity": -82,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700121000
  },
  {
    "id": "item_stock_123",
    "name": "Flake 50 Pack",
    "price": "4100.00",
    "purchasePrice": "4050.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700122000
  },
  {
    "id": "item_stock_124",
    "name": "Flash",
    "price": "17.00",
    "purchasePrice": "16.00",
    "stockQuantity": -45,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700123000
  },
  {
    "id": "item_stock_125",
    "name": "Gaslight",
    "price": "8.00",
    "purchasePrice": "7.00",
    "stockQuantity": -42,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700124000
  },
  {
    "id": "item_stock_126",
    "name": "Ghee 100 ML",
    "price": "99.00",
    "purchasePrice": "90.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700125000
  },
  {
    "id": "item_stock_127",
    "name": "Ghee",
    "price": "15.00",
    "purchasePrice": "12.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700126000
  },
  {
    "id": "item_stock_128",
    "name": "Ghee 50 GM",
    "price": "42.00",
    "purchasePrice": "39.00",
    "stockQuantity": -25,
    "unit": "GM",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700127000
  },
  {
    "id": "item_stock_129",
    "name": "Ghee. 1 KG",
    "price": "770.00",
    "purchasePrice": "740.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700128000
  },
  {
    "id": "item_stock_130",
    "name": "Glass 65 ML",
    "price": "50.00",
    "purchasePrice": "40.00",
    "stockQuantity": -1,
    "unit": "ML",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700129000
  },
  {
    "id": "item_stock_131",
    "name": "Gold Flake",
    "price": "130.00",
    "purchasePrice": "125.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700130000
  },
  {
    "id": "item_stock_132",
    "name": "Golden Baker Marie Biscuit",
    "price": "17.00",
    "purchasePrice": "15.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700131000
  },
  {
    "id": "item_stock_133",
    "name": "Golden Marie Biscuit (20peg/ -20/)",
    "price": "325.00",
    "purchasePrice": "300.00",
    "stockQuantity": -1,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700132000
  },
  {
    "id": "item_stock_134",
    "name": "Guw Muri (Puffed Rice)",
    "price": "130.00",
    "purchasePrice": "100.00",
    "stockQuantity": -16,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700133000
  },
  {
    "id": "item_stock_135",
    "name": "Hajmola",
    "price": "160.00",
    "purchasePrice": "150.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700134000
  },
  {
    "id": "item_stock_136",
    "name": "Hermoni Soap",
    "price": "9.00",
    "purchasePrice": "7.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700135000
  },
  {
    "id": "item_stock_137",
    "name": "Hirmoni Soap",
    "price": "9.00",
    "purchasePrice": "8.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700136000
  },
  {
    "id": "item_stock_138",
    "name": "Hist 400 GM",
    "price": "230.00",
    "purchasePrice": "215.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700137000
  },
  {
    "id": "item_stock_139",
    "name": "Inedependence-Water750 ML -Case",
    "price": "140.00",
    "purchasePrice": "133.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700138000
  },
  {
    "id": "item_stock_140",
    "name": "Jasmine Hair Oil",
    "price": "44.00",
    "purchasePrice": "42.00",
    "stockQuantity": -6,
    "unit": "L",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700139000
  },
  {
    "id": "item_stock_141",
    "name": "Jasmine Oil",
    "price": "19.00",
    "purchasePrice": "18.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700140000
  },
  {
    "id": "item_stock_142",
    "name": "Jubir Biri Hajar",
    "price": "270.00",
    "purchasePrice": "260.00",
    "stockQuantity": -2.5,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700141000
  },
  {
    "id": "item_stock_143",
    "name": "Kabuli Chana",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700142000
  },
  {
    "id": "item_stock_144",
    "name": "Lead Pencils",
    "price": "45.00",
    "purchasePrice": "40.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700143000
  },
  {
    "id": "item_stock_145",
    "name": "Kaju Badam",
    "price": "900.00",
    "purchasePrice": "800.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700144000
  },
  {
    "id": "item_stock_146",
    "name": "Dates (Khajur). 500 GM",
    "price": "210.00",
    "purchasePrice": "200.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700145000
  },
  {
    "id": "item_stock_147",
    "name": "Kaka Sad",
    "price": "250.00",
    "purchasePrice": "235.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700146000
  },
  {
    "id": "item_stock_148",
    "name": "Kala Pata Tal",
    "price": "25.00",
    "purchasePrice": "22.00",
    "stockQuantity": -25,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700147000
  },
  {
    "id": "item_stock_149",
    "name": "Kalar Candle",
    "price": "115.00",
    "purchasePrice": "105.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700148000
  },
  {
    "id": "item_stock_150",
    "name": "Kali Dal",
    "price": "130.00",
    "purchasePrice": "130.00",
    "stockQuantity": -2,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700149000
  },
  {
    "id": "item_stock_151",
    "name": "Kali Jeera",
    "price": "265.00",
    "purchasePrice": "255.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700150000
  },
  {
    "id": "item_stock_152",
    "name": "Kalna",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700151000
  },
  {
    "id": "item_stock_153",
    "name": "Kapi Gold Pan Masala",
    "price": "195.00",
    "purchasePrice": "192.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700152000
  },
  {
    "id": "item_stock_154",
    "name": "Carbolic Acid(25peg)",
    "price": "70.00",
    "purchasePrice": "60.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700153000
  },
  {
    "id": "item_stock_155",
    "name": "Carry Bag Black",
    "price": "140.00",
    "purchasePrice": "130.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700154000
  },
  {
    "id": "item_stock_156",
    "name": "Carry Bag Wh",
    "price": "180.00",
    "purchasePrice": "165.00",
    "stockQuantity": -4,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700155000
  },
  {
    "id": "item_stock_157",
    "name": "Kashmiri Mirch 50 GM",
    "price": "50.00",
    "purchasePrice": "48.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700156000
  },
  {
    "id": "item_stock_158",
    "name": "Notebook (Khata)",
    "price": "7.50",
    "purchasePrice": "6.50",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700157000
  },
  {
    "id": "item_stock_159",
    "name": "Notebook (Khata)",
    "price": "15.00",
    "purchasePrice": "13.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700158000
  },
  {
    "id": "item_stock_160",
    "name": "Notebook (Khata)-6/1",
    "price": "250.00",
    "purchasePrice": "220.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700159000
  },
  {
    "id": "item_stock_161",
    "name": "Notebook (Khata)-6/8",
    "price": "340.00",
    "purchasePrice": "310.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700160000
  },
  {
    "id": "item_stock_162",
    "name": "Kishmish 1 KG",
    "price": "270.00",
    "purchasePrice": "265.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700161000
  },
  {
    "id": "item_stock_163",
    "name": "L C",
    "price": "15.00",
    "purchasePrice": "0.00",
    "stockQuantity": -9,
    "unit": "L",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700162000
  },
  {
    "id": "item_stock_164",
    "name": "Lachha Semai",
    "price": "35.00",
    "purchasePrice": "32.00",
    "stockQuantity": -10,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700163000
  },
  {
    "id": "item_stock_165",
    "name": "Lal Matar",
    "price": "65.00",
    "purchasePrice": "65.00",
    "stockQuantity": -7,
    "unit": "PCS",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700164000
  },
  {
    "id": "item_stock_166",
    "name": "Laser Blade",
    "price": "75.00",
    "purchasePrice": "70.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700165000
  },
  {
    "id": "item_stock_167",
    "name": "Lifebuoy Soap",
    "price": "9.25",
    "purchasePrice": "9.00",
    "stockQuantity": -12,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700166000
  },
  {
    "id": "item_stock_168",
    "name": "Lollipop",
    "price": "50.00",
    "purchasePrice": "48.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700167000
  },
  {
    "id": "item_stock_169",
    "name": "Long",
    "price": "1500.00",
    "purchasePrice": "1200.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700168000
  },
  {
    "id": "item_stock_170",
    "name": "Lux Bundle",
    "price": "95.00",
    "purchasePrice": "90.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700169000
  },
  {
    "id": "item_stock_171",
    "name": "Lux Soap",
    "price": "9.25",
    "purchasePrice": "9.00",
    "stockQuantity": -84,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700170000
  },
  {
    "id": "item_stock_172",
    "name": "Magi",
    "price": "112.00",
    "purchasePrice": "110.00",
    "stockQuantity": -22,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700171000
  },
  {
    "id": "item_stock_173",
    "name": "Mahakosh Oil-750 ML",
    "price": "115.00",
    "purchasePrice": "112.00",
    "stockQuantity": -32,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700172000
  },
  {
    "id": "item_stock_174",
    "name": "Maida",
    "price": "1895.00",
    "purchasePrice": "1867.00",
    "stockQuantity": -4,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700173000
  },
  {
    "id": "item_stock_175",
    "name": "Maida",
    "price": "38.00",
    "purchasePrice": "36.00",
    "stockQuantity": -47,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700174000
  },
  {
    "id": "item_stock_176",
    "name": "Malkist Biscuit",
    "price": "40.00",
    "purchasePrice": "38.00",
    "stockQuantity": -5,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700175000
  },
  {
    "id": "item_stock_177",
    "name": "Mama -G",
    "price": "50.00",
    "purchasePrice": "45.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700176000
  },
  {
    "id": "item_stock_178",
    "name": "Mandir Dhoop Agarbatti",
    "price": "100.00",
    "purchasePrice": "90.00",
    "stockQuantity": -3,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700177000
  },
  {
    "id": "item_stock_179",
    "name": "Masoor Dal",
    "price": "79.00",
    "purchasePrice": "75.25",
    "stockQuantity": -112,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700178000
  },
  {
    "id": "item_stock_180",
    "name": "Mustard Oil 1 L",
    "price": "129.00",
    "purchasePrice": "125.00",
    "stockQuantity": -40,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700179000
  },
  {
    "id": "item_stock_181",
    "name": "Mustard Oil 200 ML",
    "price": "29.00",
    "purchasePrice": "28.00",
    "stockQuantity": -49,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700180000
  },
  {
    "id": "item_stock_182",
    "name": "Mustard Oil 500 ML",
    "price": "66.50",
    "purchasePrice": "64.00",
    "stockQuantity": -90,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700181000
  },
  {
    "id": "item_stock_183",
    "name": "Mathi",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": -2.1,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700182000
  },
  {
    "id": "item_stock_184",
    "name": "Mathipata",
    "price": "27.00",
    "purchasePrice": "25.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700183000
  },
  {
    "id": "item_stock_185",
    "name": "Milk N Nut",
    "price": "200.00",
    "purchasePrice": "180.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700184000
  },
  {
    "id": "item_stock_186",
    "name": "Mimi",
    "price": "200.00",
    "purchasePrice": "190.00",
    "stockQuantity": -5,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700185000
  },
  {
    "id": "item_stock_187",
    "name": "Mirchi 5 KG",
    "price": "950.00",
    "purchasePrice": "980.00",
    "stockQuantity": -2,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700186000
  },
  {
    "id": "item_stock_188",
    "name": "Mirchi",
    "price": "320.00",
    "purchasePrice": "300.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700187000
  },
  {
    "id": "item_stock_189",
    "name": "Misti 1 KG",
    "price": "95.00",
    "purchasePrice": "88.00",
    "stockQuantity": -3,
    "unit": "KG",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700188000
  },
  {
    "id": "item_stock_190",
    "name": "Mithai Mate 200 GM",
    "price": "64.50",
    "purchasePrice": "63.00",
    "stockQuantity": -2,
    "unit": "GM",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700189000
  },
  {
    "id": "item_stock_191",
    "name": "Honey (Madhu)",
    "price": "73.00",
    "purchasePrice": "70.00",
    "stockQuantity": -10.44,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700190000
  },
  {
    "id": "item_stock_192",
    "name": "Moon Chips",
    "price": "90.00",
    "purchasePrice": "85.00",
    "stockQuantity": -19,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700191000
  },
  {
    "id": "item_stock_193",
    "name": "Moong Dal",
    "price": "90.00",
    "purchasePrice": "82.00",
    "stockQuantity": -11,
    "unit": "KG",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700192000
  },
  {
    "id": "item_stock_194",
    "name": "Mosar Dhoop",
    "price": "75.00",
    "purchasePrice": "70.00",
    "stockQuantity": -16,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700193000
  },
  {
    "id": "item_stock_195",
    "name": "Motar Baza",
    "price": "90.00",
    "purchasePrice": "75.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700194000
  },
  {
    "id": "item_stock_196",
    "name": "Motar",
    "price": "63.00",
    "purchasePrice": "59.00",
    "stockQuantity": -23.5,
    "unit": "PCS",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700195000
  },
  {
    "id": "item_stock_197",
    "name": "Muri (Puffed Rice) Rice 50 KG",
    "price": "2175.00",
    "purchasePrice": "2137.50",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700196000
  },
  {
    "id": "item_stock_198",
    "name": "Muri (Puffed Rice)-(300peg)",
    "price": "300.00",
    "purchasePrice": "270.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700197000
  },
  {
    "id": "item_stock_199",
    "name": "Muri (Puffed Rice)",
    "price": "7.50",
    "purchasePrice": "6.00",
    "stockQuantity": -10,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700198000
  },
  {
    "id": "item_stock_200",
    "name": "N K Salt 25 KG",
    "price": "200.00",
    "purchasePrice": "180.00",
    "stockQuantity": -2,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700199000
  },
  {
    "id": "item_stock_201",
    "name": "Nasir Bari(40 Pack)",
    "price": "870.00",
    "purchasePrice": "850.00",
    "stockQuantity": -12.25,
    "unit": "PKT",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700200000
  },
  {
    "id": "item_stock_202",
    "name": "Nasir Bari -(25 Sula)",
    "price": "21.00",
    "purchasePrice": "20.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700201000
  },
  {
    "id": "item_stock_203",
    "name": "Navratna Oil 50 ML",
    "price": "44.00",
    "purchasePrice": "42.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700202000
  },
  {
    "id": "item_stock_204",
    "name": "Nihar Hair Oil",
    "price": "19.00",
    "purchasePrice": "18.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700203000
  },
  {
    "id": "item_stock_205",
    "name": "Nihar-100 ML",
    "price": "42.00",
    "purchasePrice": "39.00",
    "stockQuantity": -12,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700204000
  },
  {
    "id": "item_stock_206",
    "name": "Nimboo Pani",
    "price": "190.00",
    "purchasePrice": "185.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700205000
  },
  {
    "id": "item_stock_207",
    "name": "Nakuldana-1 KG",
    "price": "65.00",
    "purchasePrice": "62.00",
    "stockQuantity": -6,
    "unit": "KG",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700206000
  },
  {
    "id": "item_stock_208",
    "name": "Nauka Bati",
    "price": "35.00",
    "purchasePrice": "30.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700207000
  },
  {
    "id": "item_stock_209",
    "name": "Onion",
    "price": "53.00",
    "purchasePrice": "52.00",
    "stockQuantity": -302.1,
    "unit": "KG",
    "category": "Fresh Produce",
    "defaultDiscount": "",
    "updatedAt": 1730700208000
  },
  {
    "id": "item_stock_210",
    "name": "Paneer 400 ML",
    "price": "104.00",
    "purchasePrice": "97.00",
    "stockQuantity": -2,
    "unit": "ML",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700209000
  },
  {
    "id": "item_stock_211",
    "name": "Paneer200 ML",
    "price": "55.00",
    "purchasePrice": "52.00",
    "stockQuantity": -2,
    "unit": "ML",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700210000
  },
  {
    "id": "item_stock_212",
    "name": "Paneer 1 KG",
    "price": "180.00",
    "purchasePrice": "170.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Dairy & Bakery",
    "defaultDiscount": "",
    "updatedAt": 1730700211000
  },
  {
    "id": "item_stock_213",
    "name": "Papad Pink 200 GM",
    "price": "57.00",
    "purchasePrice": "64.00",
    "stockQuantity": -2,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700212000
  },
  {
    "id": "item_stock_214",
    "name": "Papad Pink 500 GM",
    "price": "140.00",
    "purchasePrice": "135.00",
    "stockQuantity": -2,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700213000
  },
  {
    "id": "item_stock_215",
    "name": "Papad",
    "price": "35.00",
    "purchasePrice": "30.00",
    "stockQuantity": -13,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700214000
  },
  {
    "id": "item_stock_216",
    "name": "Papar K",
    "price": "35.00",
    "purchasePrice": "0.00",
    "stockQuantity": -21,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700215000
  },
  {
    "id": "item_stock_217",
    "name": "Paper",
    "price": "50.00",
    "purchasePrice": "40.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700216000
  },
  {
    "id": "item_stock_218",
    "name": "Parachute Coconut Oil 75 ML",
    "price": "65.00",
    "purchasePrice": "63.00",
    "stockQuantity": -5,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700217000
  },
  {
    "id": "item_stock_219",
    "name": "Parachute Coconut Oil 175 ML",
    "price": "85.00",
    "purchasePrice": "77.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700218000
  },
  {
    "id": "item_stock_220",
    "name": "Parle -G",
    "price": "70.00",
    "purchasePrice": "68.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700219000
  },
  {
    "id": "item_stock_221",
    "name": "Parle-G Biscuit",
    "price": "9.00",
    "purchasePrice": "8.75",
    "stockQuantity": -72,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700220000
  },
  {
    "id": "item_stock_222",
    "name": "Parle Happy Happy Biscuit-24 PCS",
    "price": "110.00",
    "purchasePrice": "105.00",
    "stockQuantity": -5,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700221000
  },
  {
    "id": "item_stock_223",
    "name": "Panch Phoron KG",
    "price": "140.00",
    "purchasePrice": "120.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700222000
  },
  {
    "id": "item_stock_224",
    "name": "Payesh Bati",
    "price": "70.00",
    "purchasePrice": "50.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700223000
  },
  {
    "id": "item_stock_225",
    "name": "Pen-(6pce)",
    "price": "20.00",
    "purchasePrice": "17.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700224000
  },
  {
    "id": "item_stock_226",
    "name": "Plam Oil 15 L TIN",
    "price": "2190.00",
    "purchasePrice": "1930.00",
    "stockQuantity": -6,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700225000
  },
  {
    "id": "item_stock_227",
    "name": "Lollipop",
    "price": "260.00",
    "purchasePrice": "250.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700226000
  },
  {
    "id": "item_stock_228",
    "name": "Lollipop",
    "price": "180.00",
    "purchasePrice": "160.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700227000
  },
  {
    "id": "item_stock_229",
    "name": "Pond's Powder",
    "price": "198.00",
    "purchasePrice": "192.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700228000
  },
  {
    "id": "item_stock_230",
    "name": "Parimal Rice",
    "price": "32.00",
    "purchasePrice": "30.55",
    "stockQuantity": -50,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700229000
  },
  {
    "id": "item_stock_231",
    "name": "Fresh Potato",
    "price": "19.00",
    "purchasePrice": "16.50",
    "stockQuantity": -794.5,
    "unit": "KG",
    "category": "Fresh Produce",
    "defaultDiscount": "",
    "updatedAt": 1730700230000
  },
  {
    "id": "item_stock_232",
    "name": "Potato",
    "price": "18.00",
    "purchasePrice": "0.00",
    "stockQuantity": -60,
    "unit": "KG",
    "category": "Fresh Produce",
    "defaultDiscount": "",
    "updatedAt": 1730700231000
  },
  {
    "id": "item_stock_233",
    "name": "Pran Ice Crop",
    "price": "180.00",
    "purchasePrice": "170.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700232000
  },
  {
    "id": "item_stock_234",
    "name": "Pran Jely",
    "price": "150.00",
    "purchasePrice": "140.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700233000
  },
  {
    "id": "item_stock_235",
    "name": "Pran Litchu 12 Pc",
    "price": "110.00",
    "purchasePrice": "100.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700234000
  },
  {
    "id": "item_stock_236",
    "name": "Pran Toast",
    "price": "42.00",
    "purchasePrice": "38.00",
    "stockQuantity": -20,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700235000
  },
  {
    "id": "item_stock_237",
    "name": "Pulse Chocolate",
    "price": "160.00",
    "purchasePrice": "150.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700236000
  },
  {
    "id": "item_stock_238",
    "name": "Pani Puri (Phuchka)-1 KG",
    "price": "80.00",
    "purchasePrice": "75.00",
    "stockQuantity": -5,
    "unit": "KG",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700237000
  },
  {
    "id": "item_stock_239",
    "name": "Raja Tea 100 GM",
    "price": "285.00",
    "purchasePrice": "277.00",
    "stockQuantity": -5,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700238000
  },
  {
    "id": "item_stock_240",
    "name": "Raja Tea 50 GM",
    "price": "285.00",
    "purchasePrice": "280.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700239000
  },
  {
    "id": "item_stock_241",
    "name": "Red Rose Rice",
    "price": "40.00",
    "purchasePrice": "39.25",
    "stockQuantity": -26,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700240000
  },
  {
    "id": "item_stock_242",
    "name": "Refined. 200 ML",
    "price": "33.00",
    "purchasePrice": "31.00",
    "stockQuantity": -30,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700241000
  },
  {
    "id": "item_stock_243",
    "name": "Refined 500 ML",
    "price": "71.50",
    "purchasePrice": "67.00",
    "stockQuantity": -84,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700242000
  },
  {
    "id": "item_stock_244",
    "name": "Refined 1 L",
    "price": "135.00",
    "purchasePrice": "130.00",
    "stockQuantity": -60,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700243000
  },
  {
    "id": "item_stock_245",
    "name": "Rice Raj Rani 26 KG",
    "price": "1180.00",
    "purchasePrice": "1150.00",
    "stockQuantity": -1,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700244000
  },
  {
    "id": "item_stock_246",
    "name": "Rassi (Rope)",
    "price": "140.00",
    "purchasePrice": "130.00",
    "stockQuantity": -1.49,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700245000
  },
  {
    "id": "item_stock_247",
    "name": "Garlic (Rosun)",
    "price": "135.00",
    "purchasePrice": "120.00",
    "stockQuantity": -13,
    "unit": "KG",
    "category": "Fresh Produce",
    "defaultDiscount": "",
    "updatedAt": 1730700246000
  },
  {
    "id": "item_stock_248",
    "name": "Ruchi Rice 500 ML",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": 0,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700247000
  },
  {
    "id": "item_stock_249",
    "name": "S N T Rice",
    "price": "40.00",
    "purchasePrice": "35.00",
    "stockQuantity": -6,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700248000
  },
  {
    "id": "item_stock_250",
    "name": "Sada",
    "price": "215.00",
    "purchasePrice": "200.00",
    "stockQuantity": -5,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700249000
  },
  {
    "id": "item_stock_251",
    "name": "Sago 400 GM",
    "price": "60.00",
    "purchasePrice": "55.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700250000
  },
  {
    "id": "item_stock_252",
    "name": "Sago Loose",
    "price": "70.00",
    "purchasePrice": "65.00",
    "stockQuantity": -9.4,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700251000
  },
  {
    "id": "item_stock_253",
    "name": "Salt -50 KG",
    "price": "375.00",
    "purchasePrice": "350.00",
    "stockQuantity": -4,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700252000
  },
  {
    "id": "item_stock_254",
    "name": "Salt",
    "price": "10.00",
    "purchasePrice": "8.00",
    "stockQuantity": -2,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700253000
  },
  {
    "id": "item_stock_255",
    "name": "Sarso",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": -1.5,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700254000
  },
  {
    "id": "item_stock_256",
    "name": "Sati Food -200 GM",
    "price": "50.00",
    "purchasePrice": "45.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700255000
  },
  {
    "id": "item_stock_257",
    "name": "Sabun 500 GM Boll KG",
    "price": "70.00",
    "purchasePrice": "62.00",
    "stockQuantity": -13,
    "unit": "KG",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700256000
  },
  {
    "id": "item_stock_258",
    "name": "Sabun Dutta KG",
    "price": "95.00",
    "purchasePrice": "90.00",
    "stockQuantity": -15.5,
    "unit": "KG",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700257000
  },
  {
    "id": "item_stock_259",
    "name": "Seat Sabun",
    "price": "80.00",
    "purchasePrice": "70.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700258000
  },
  {
    "id": "item_stock_260",
    "name": "Seat Sabun",
    "price": "27.00",
    "purchasePrice": "24.00",
    "stockQuantity": -6,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700259000
  },
  {
    "id": "item_stock_261",
    "name": "Sethji Mustard Oil 500 ML",
    "price": "208.00",
    "purchasePrice": "205.00",
    "stockQuantity": -60,
    "unit": "ML",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700260000
  },
  {
    "id": "item_stock_262",
    "name": "Sethji Mustard Oil 1 L",
    "price": "209.00",
    "purchasePrice": "205.00",
    "stockQuantity": -27,
    "unit": "L",
    "category": "Oil & Ghee",
    "defaultDiscount": "",
    "updatedAt": 1730700261000
  },
  {
    "id": "item_stock_263",
    "name": "Sewai",
    "price": "11.00",
    "purchasePrice": "9.00",
    "stockQuantity": -20,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700262000
  },
  {
    "id": "item_stock_264",
    "name": "Sewai",
    "price": "45.00",
    "purchasePrice": "38.00",
    "stockQuantity": -6,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700263000
  },
  {
    "id": "item_stock_265",
    "name": "Shampoo Clinic-Plus",
    "price": "0.85",
    "purchasePrice": "0.80",
    "stockQuantity": -500,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700264000
  },
  {
    "id": "item_stock_266",
    "name": "Shikhar Pan Masala",
    "price": "210.00",
    "purchasePrice": "205.00",
    "stockQuantity": -22,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700265000
  },
  {
    "id": "item_stock_267",
    "name": "Chowmein",
    "price": "25.00",
    "purchasePrice": "22.00",
    "stockQuantity": -5,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700266000
  },
  {
    "id": "item_stock_268",
    "name": "Siggnature",
    "price": "440.00",
    "purchasePrice": "430.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700267000
  },
  {
    "id": "item_stock_269",
    "name": "Sirka",
    "price": "20.00",
    "purchasePrice": "18.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700268000
  },
  {
    "id": "item_stock_270",
    "name": "Soan Papdi",
    "price": "200.00",
    "purchasePrice": "190.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700269000
  },
  {
    "id": "item_stock_271",
    "name": "Mustard Seeds (Sarson)",
    "price": "120.00",
    "purchasePrice": "110.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700270000
  },
  {
    "id": "item_stock_272",
    "name": "Soybin",
    "price": "80.00",
    "purchasePrice": "75.00",
    "stockQuantity": -15.75,
    "unit": "PCS",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700271000
  },
  {
    "id": "item_stock_273",
    "name": "Soybin",
    "price": "9.00",
    "purchasePrice": "8.00",
    "stockQuantity": -24,
    "unit": "PCS",
    "category": "Dal & Pulses",
    "defaultDiscount": "",
    "updatedAt": 1730700272000
  },
  {
    "id": "item_stock_274",
    "name": "Stil Brash Pata",
    "price": "70.00",
    "purchasePrice": "55.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700273000
  },
  {
    "id": "item_stock_275",
    "name": "Baking Soda",
    "price": "85.00",
    "purchasePrice": "80.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700274000
  },
  {
    "id": "item_stock_276",
    "name": "Sugar",
    "price": "62.00",
    "purchasePrice": "58.50",
    "stockQuantity": -365.11,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700275000
  },
  {
    "id": "item_stock_277",
    "name": "Sugar Crackers Biscuit",
    "price": "17.00",
    "purchasePrice": "15.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700276000
  },
  {
    "id": "item_stock_278",
    "name": "Sugar Crackers.biscuit. (20peg 20)",
    "price": "330.00",
    "purchasePrice": "300.00",
    "stockQuantity": -2,
    "unit": "PKT",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700277000
  },
  {
    "id": "item_stock_279",
    "name": "Suji 500 GM",
    "price": "40.00",
    "purchasePrice": "30.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700278000
  },
  {
    "id": "item_stock_280",
    "name": "Suji 500 GM",
    "price": "40.00",
    "purchasePrice": "35.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700279000
  },
  {
    "id": "item_stock_281",
    "name": "Suji",
    "price": "42.00",
    "purchasePrice": "40.00",
    "stockQuantity": -7,
    "unit": "KG",
    "category": "Flour & Atta",
    "defaultDiscount": "",
    "updatedAt": 1730700280000
  },
  {
    "id": "item_stock_282",
    "name": "Sunrise Combo",
    "price": "6.67",
    "purchasePrice": "6.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700281000
  },
  {
    "id": "item_stock_283",
    "name": "Sunrise Donia 100 GM",
    "price": "300.00",
    "purchasePrice": "0.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700282000
  },
  {
    "id": "item_stock_284",
    "name": "Sunrise Elachi",
    "price": "8.00",
    "purchasePrice": "7.50",
    "stockQuantity": -20,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700283000
  },
  {
    "id": "item_stock_285",
    "name": "Sunrise Garam Masla",
    "price": "3.67",
    "purchasePrice": "3.38",
    "stockQuantity": -60,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700284000
  },
  {
    "id": "item_stock_286",
    "name": "Sunrise Haldi -200 GM",
    "price": "330.00",
    "purchasePrice": "310.00",
    "stockQuantity": -0.9,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700285000
  },
  {
    "id": "item_stock_287",
    "name": "Sunrise Haldi -500 GM",
    "price": "330.00",
    "purchasePrice": "235.00",
    "stockQuantity": -1.5,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700286000
  },
  {
    "id": "item_stock_288",
    "name": "Sunrise Haldi",
    "price": "290.00",
    "purchasePrice": "270.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700287000
  },
  {
    "id": "item_stock_289",
    "name": "Sunrise Haldi",
    "price": "300.00",
    "purchasePrice": "270.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700288000
  },
  {
    "id": "item_stock_290",
    "name": "Sunrise Haldi 100 GM",
    "price": "330.00",
    "purchasePrice": "315.00",
    "stockQuantity": -9,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700289000
  },
  {
    "id": "item_stock_291",
    "name": "Sunrise Haldi 200 GM",
    "price": "250.00",
    "purchasePrice": "235.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700290000
  },
  {
    "id": "item_stock_292",
    "name": "Sunrise Haldi 50 GM",
    "price": "250.00",
    "purchasePrice": "228.00",
    "stockQuantity": -7,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700291000
  },
  {
    "id": "item_stock_293",
    "name": "Sunrise Jeera 100 GM",
    "price": "550.00",
    "purchasePrice": "525.00",
    "stockQuantity": -2,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700292000
  },
  {
    "id": "item_stock_294",
    "name": "Sunrise Jeera 500 GM",
    "price": "530.00",
    "purchasePrice": "500.00",
    "stockQuantity": -2,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700293000
  },
  {
    "id": "item_stock_295",
    "name": "Sunrise Jeera 50 GM",
    "price": "500.00",
    "purchasePrice": "468.00",
    "stockQuantity": -3.7,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700294000
  },
  {
    "id": "item_stock_296",
    "name": "Sunrise Jeera",
    "price": "8.00",
    "purchasePrice": "7.50",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700295000
  },
  {
    "id": "item_stock_297",
    "name": "Sunrise Meat Masla",
    "price": "3.67",
    "purchasePrice": "3.38",
    "stockQuantity": -70,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700296000
  },
  {
    "id": "item_stock_298",
    "name": "Sunrise Meat -Masla 50 GM",
    "price": "40.00",
    "purchasePrice": "39.00",
    "stockQuantity": -1,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700297000
  },
  {
    "id": "item_stock_299",
    "name": "Sunrise Methi Pata",
    "price": "30.00",
    "purchasePrice": "20.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700298000
  },
  {
    "id": "item_stock_300",
    "name": "Sunrise Mirchi",
    "price": "8.00",
    "purchasePrice": "7.50",
    "stockQuantity": -60,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700299000
  },
  {
    "id": "item_stock_301",
    "name": "Sunrise Mirchi 200 GM",
    "price": "500.00",
    "purchasePrice": "462.50",
    "stockQuantity": -1.7,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700300000
  },
  {
    "id": "item_stock_302",
    "name": "Sunrise Mirchi 500 GM",
    "price": "500.00",
    "purchasePrice": "457.90",
    "stockQuantity": -1.5,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700301000
  },
  {
    "id": "item_stock_303",
    "name": "Sunrise Mirchi 50 GM",
    "price": "500.00",
    "purchasePrice": "467.25",
    "stockQuantity": -4,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700302000
  },
  {
    "id": "item_stock_304",
    "name": "Sunrise Mirchi-100 GM",
    "price": "350.00",
    "purchasePrice": "328.00",
    "stockQuantity": -12,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700303000
  },
  {
    "id": "item_stock_305",
    "name": "Sunrise Panch Phoron",
    "price": "8.00",
    "purchasePrice": "7.50",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700304000
  },
  {
    "id": "item_stock_306",
    "name": "Sunrise Panch Phoron-Jeera-Ajwin",
    "price": "7.00",
    "purchasePrice": "6.40",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700305000
  },
  {
    "id": "item_stock_307",
    "name": "Surf Excel",
    "price": "9.25",
    "purchasePrice": "9.00",
    "stockQuantity": -64,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700306000
  },
  {
    "id": "item_stock_308",
    "name": "Surf Excel 120peg",
    "price": "1070.00",
    "purchasePrice": "1050.00",
    "stockQuantity": -4,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700307000
  },
  {
    "id": "item_stock_309",
    "name": "Surf Excel 500 GM",
    "price": "71.00",
    "purchasePrice": "68.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700308000
  },
  {
    "id": "item_stock_310",
    "name": "Surf Excel Excel Bucket 2 KG",
    "price": "235.00",
    "purchasePrice": "220.00",
    "stockQuantity": -2,
    "unit": "KG",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700309000
  },
  {
    "id": "item_stock_311",
    "name": "Swastik Rice",
    "price": "1200.00",
    "purchasePrice": "1159.00",
    "stockQuantity": -8,
    "unit": "KG",
    "category": "Rice & Grains",
    "defaultDiscount": "",
    "updatedAt": 1730700310000
  },
  {
    "id": "item_stock_312",
    "name": "Sweet Supari",
    "price": "40.00",
    "purchasePrice": "38.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700311000
  },
  {
    "id": "item_stock_313",
    "name": "Taaz Blades",
    "price": "40.00",
    "purchasePrice": "35.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700312000
  },
  {
    "id": "item_stock_314",
    "name": "Taaza 1 L",
    "price": "75.00",
    "purchasePrice": "73.00",
    "stockQuantity": 0,
    "unit": "L",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700313000
  },
  {
    "id": "item_stock_315",
    "name": "Taaza 200 ML",
    "price": "450.00",
    "purchasePrice": "440.00",
    "stockQuantity": -4,
    "unit": "ML",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700314000
  },
  {
    "id": "item_stock_316",
    "name": "Taaza 200 ML",
    "price": "15.00",
    "purchasePrice": "14.50",
    "stockQuantity": -6,
    "unit": "ML",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700315000
  },
  {
    "id": "item_stock_317",
    "name": "Taaza500 ML",
    "price": "38.00",
    "purchasePrice": "36.50",
    "stockQuantity": -12,
    "unit": "ML",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700316000
  },
  {
    "id": "item_stock_318",
    "name": "Taal Mishri 1 KG",
    "price": "130.00",
    "purchasePrice": "120.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700317000
  },
  {
    "id": "item_stock_319",
    "name": "Tar-22",
    "price": "110.00",
    "purchasePrice": "100.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700318000
  },
  {
    "id": "item_stock_320",
    "name": "Tata I Shakti- 25 KG.salt",
    "price": "300.00",
    "purchasePrice": "250.00",
    "stockQuantity": -3,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700319000
  },
  {
    "id": "item_stock_321",
    "name": "Tata Mirchi 100 GM",
    "price": "500.00",
    "purchasePrice": "390.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700320000
  },
  {
    "id": "item_stock_322",
    "name": "Tata Salt 1 KG",
    "price": "30.00",
    "purchasePrice": "27.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700321000
  },
  {
    "id": "item_stock_323",
    "name": "Tata Salt",
    "price": "1370.00",
    "purchasePrice": "1300.00",
    "stockQuantity": 0,
    "unit": "KG",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700322000
  },
  {
    "id": "item_stock_324",
    "name": "Tea Ch 100 GM",
    "price": "285.00",
    "purchasePrice": "277.00",
    "stockQuantity": -8,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700323000
  },
  {
    "id": "item_stock_325",
    "name": "Tea Ch 250 GM",
    "price": "285.00",
    "purchasePrice": "277.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700324000
  },
  {
    "id": "item_stock_326",
    "name": "Tea Ch 250 GM",
    "price": "75.00",
    "purchasePrice": "65.00",
    "stockQuantity": -4,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700325000
  },
  {
    "id": "item_stock_327",
    "name": "Tea Loose",
    "price": "170.00",
    "purchasePrice": "150.00",
    "stockQuantity": -7.5,
    "unit": "KG",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700326000
  },
  {
    "id": "item_stock_328",
    "name": "Tez Blades 50 Pc",
    "price": "42.50",
    "purchasePrice": "38.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "General Grocery",
    "defaultDiscount": "",
    "updatedAt": 1730700327000
  },
  {
    "id": "item_stock_329",
    "name": "Tisu -Paper",
    "price": "21.00",
    "purchasePrice": "18.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700328000
  },
  {
    "id": "item_stock_330",
    "name": "Toast",
    "price": "200.00",
    "purchasePrice": "190.00",
    "stockQuantity": 0,
    "unit": "PKT",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700329000
  },
  {
    "id": "item_stock_331",
    "name": "Tomato Sauce",
    "price": "65.00",
    "purchasePrice": "60.00",
    "stockQuantity": -24,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700330000
  },
  {
    "id": "item_stock_332",
    "name": "Tomato Sauce",
    "price": "60.00",
    "purchasePrice": "52.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700331000
  },
  {
    "id": "item_stock_333",
    "name": "Ujala",
    "price": "110.00",
    "purchasePrice": "105.00",
    "stockQuantity": -2,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700332000
  },
  {
    "id": "item_stock_334",
    "name": "Valley Tea",
    "price": "8.50",
    "purchasePrice": "8.00",
    "stockQuantity": -20,
    "unit": "PCS",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700333000
  },
  {
    "id": "item_stock_335",
    "name": "Valley Tea -100 GM",
    "price": "250.00",
    "purchasePrice": "230.00",
    "stockQuantity": -3,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700334000
  },
  {
    "id": "item_stock_336",
    "name": "Valley Tea 250 GM",
    "price": "250.00",
    "purchasePrice": "240.00",
    "stockQuantity": 0,
    "unit": "GM",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700335000
  },
  {
    "id": "item_stock_337",
    "name": "Vasocare JAR",
    "price": "220.00",
    "purchasePrice": "210.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Personal Care",
    "defaultDiscount": "",
    "updatedAt": 1730700336000
  },
  {
    "id": "item_stock_338",
    "name": "Vim",
    "price": "55.00",
    "purchasePrice": "53.00",
    "stockQuantity": -1,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700337000
  },
  {
    "id": "item_stock_339",
    "name": "Vim Dishwash Bar",
    "price": "9.25",
    "purchasePrice": "9.00",
    "stockQuantity": -18,
    "unit": "PCS",
    "category": "Household & Cleaning",
    "defaultDiscount": "",
    "updatedAt": 1730700338000
  },
  {
    "id": "item_stock_340",
    "name": "Packaged Drinking Water (15 PCS)",
    "price": "100.00",
    "purchasePrice": "90.00",
    "stockQuantity": -3,
    "unit": "ML",
    "category": "Snacks & Beverages",
    "defaultDiscount": "",
    "updatedAt": 1730700339000
  },
  {
    "id": "item_stock_341",
    "name": "Yellow Food Color",
    "price": "75.00",
    "purchasePrice": "55.00",
    "stockQuantity": 0,
    "unit": "PCS",
    "category": "Spices & Masala",
    "defaultDiscount": "",
    "updatedAt": 1730700340000
  }
];

const rawGroceryStock = [
  {
    "slNo": 1,
    "itemName": "20+20BISCUITE 20/-",
    "salePrice": 360,
    "purchasePrice": 350,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 2,
    "itemName": "ACHAR 10/*",
    "salePrice": 8.5,
    "purchasePrice": 7,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 3,
    "itemName": "ACHAR 200 G M",
    "salePrice": 35,
    "purchasePrice": 32.5,
    "stockQuantity": -21,
    "stockValue": 0
  },
  {
    "slNo": 4,
    "itemName": "ACHAR 5KG",
    "salePrice": 200,
    "purchasePrice": 180,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 5,
    "itemName": "AD SOAP-7PCE",
    "salePrice": 55,
    "purchasePrice": 50,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 6,
    "itemName": "AJWIN**",
    "salePrice": 260,
    "purchasePrice": 250,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 7,
    "itemName": "ALPEN*GOLD CHOKLATE",
    "salePrice": 185,
    "purchasePrice": 177,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 8,
    "itemName": "AMLA 20/*",
    "salePrice": 19,
    "purchasePrice": 18.5,
    "stockQuantity": -12,
    "stockValue": 0
  },
  {
    "slNo": 9,
    "itemName": "AMLA HAIR OIL-105/",
    "salePrice": 99,
    "purchasePrice": 95,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 10,
    "itemName": "AMLA HAIR OIL-50/",
    "salePrice": 47,
    "purchasePrice": 45,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 11,
    "itemName": "AMUL 10/*",
    "salePrice": 110,
    "purchasePrice": 108,
    "stockQuantity": -21,
    "stockValue": 0
  },
  {
    "slNo": 12,
    "itemName": "AMUL 100GM",
    "salePrice": 46.5,
    "purchasePrice": 45,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 13,
    "itemName": "AMUL 500GM DIBA",
    "salePrice": 240,
    "purchasePrice": 235,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 14,
    "itemName": "AMUL-1KG",
    "salePrice": 450,
    "purchasePrice": 430,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 15,
    "itemName": "AMUL10/**",
    "salePrice": 10,
    "purchasePrice": 9.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 16,
    "itemName": "AMULY 10kg JAR",
    "salePrice": 3975,
    "purchasePrice": 3900,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 17,
    "itemName": "AMULY**",
    "salePrice": 400,
    "purchasePrice": 390,
    "stockQuantity": -1.5,
    "stockValue": 0
  },
  {
    "slNo": 18,
    "itemName": "AR SORBOT 170/*",
    "salePrice": 160,
    "purchasePrice": 140,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 19,
    "itemName": "ARHAM RICE**",
    "salePrice": 64.5,
    "purchasePrice": 63.75,
    "stockQuantity": -52,
    "stockValue": 0
  },
  {
    "slNo": 20,
    "itemName": "ARHAR DAL**",
    "salePrice": 105,
    "purchasePrice": 98,
    "stockQuantity": -7,
    "stockValue": 0
  },
  {
    "slNo": 21,
    "itemName": "ARJUNA**",
    "salePrice": 370,
    "purchasePrice": 355,
    "stockQuantity": -7,
    "stockValue": 0
  },
  {
    "slNo": 22,
    "itemName": "ASATA JEERA 1 KG",
    "salePrice": 280,
    "purchasePrice": 250,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 23,
    "itemName": "ASTA DONIA",
    "salePrice": 200,
    "purchasePrice": 190,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 24,
    "itemName": "ASTA GARAM MASALA 10/",
    "salePrice": 100,
    "purchasePrice": 90,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 25,
    "itemName": "ASTA JEER",
    "salePrice": 420,
    "purchasePrice": 390,
    "stockQuantity": -0.5,
    "stockValue": 0
  },
  {
    "slNo": 26,
    "itemName": "ASTA MIRCHI**-",
    "salePrice": 185,
    "purchasePrice": 170,
    "stockQuantity": -1.35,
    "stockValue": 0
  },
  {
    "slNo": 27,
    "itemName": "ASTA MOONG",
    "salePrice": 120,
    "purchasePrice": 105,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 28,
    "itemName": "ATTA",
    "salePrice": 1895,
    "purchasePrice": 1867,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 29,
    "itemName": "ATTA **",
    "salePrice": 38,
    "purchasePrice": 35,
    "stockQuantity": -33,
    "stockValue": 0
  },
  {
    "slNo": 30,
    "itemName": "ATTA 1KG PEG**",
    "salePrice": 50,
    "purchasePrice": 41,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 31,
    "itemName": "AUMLY",
    "salePrice": 3900,
    "purchasePrice": 3850,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 32,
    "itemName": "BADAM KACHA",
    "salePrice": 155,
    "purchasePrice": 145,
    "stockQuantity": -1.5,
    "stockValue": 0
  },
  {
    "slNo": 33,
    "itemName": "BAG-10/",
    "salePrice": 8,
    "purchasePrice": 5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 34,
    "itemName": "BAG-20/",
    "salePrice": 17,
    "purchasePrice": 15,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 35,
    "itemName": "BAG-30/",
    "salePrice": 26,
    "purchasePrice": 24,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 36,
    "itemName": "BAJAJ OIL 44/*",
    "salePrice": 44,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 37,
    "itemName": "BAKING POWER",
    "salePrice": 80,
    "purchasePrice": 70,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 38,
    "itemName": "BAROBAKHAR 10/*",
    "salePrice": 8,
    "purchasePrice": 7,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 39,
    "itemName": "BAROBAKHAR-100GM**",
    "salePrice": 260,
    "purchasePrice": 230,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 40,
    "itemName": "BAROBAKHAR-200GM**",
    "salePrice": 260,
    "purchasePrice": 260,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 41,
    "itemName": "BAROBAKHAR-40PCS-10/**",
    "salePrice": 270,
    "purchasePrice": 230,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 42,
    "itemName": "BATHI**",
    "salePrice": 75,
    "purchasePrice": 65,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 43,
    "itemName": "BESON LOSE**",
    "salePrice": 75,
    "purchasePrice": 70,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 44,
    "itemName": "BESON PEG",
    "salePrice": 140,
    "purchasePrice": 1250,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 45,
    "itemName": "BEST CHOICE *REFIND OIL 1LTRS,POUCH",
    "salePrice": 125,
    "purchasePrice": 120,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 46,
    "itemName": "BHUJIA-700GM",
    "salePrice": 65,
    "purchasePrice": 60,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 47,
    "itemName": "BIYARANI 1 KG",
    "salePrice": 160,
    "purchasePrice": 135,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 48,
    "itemName": "BRITANNIA --- THIN-5/*",
    "salePrice": 540,
    "purchasePrice": 525,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 49,
    "itemName": "BRITANNIA ---GOOD DAY ---40/***",
    "salePrice": 36,
    "purchasePrice": 34,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 50,
    "itemName": "BRITANNIA MARIE GOLD 40/**",
    "salePrice": 36,
    "purchasePrice": 34,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 51,
    "itemName": "BRITANNIA THIN -40/",
    "salePrice": 36,
    "purchasePrice": 33.5,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 52,
    "itemName": "BRITANNIA****CARIM BISCUIT--5/***",
    "salePrice": 55,
    "purchasePrice": 52,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 53,
    "itemName": "BRITANNIA****CRACKER50/**",
    "salePrice": 46,
    "purchasePrice": 42,
    "stockQuantity": -14,
    "stockValue": 0
  },
  {
    "slNo": 54,
    "itemName": "BRITANNIA****MARIE GOLD***-25/***",
    "salePrice": 22.5,
    "purchasePrice": 22,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 55,
    "itemName": "BRITANNIA****TOASE 35/*",
    "salePrice": 32,
    "purchasePrice": 35,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 56,
    "itemName": "BRITANNIA---- THIN -5/**",
    "salePrice": 55,
    "purchasePrice": 53,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 57,
    "itemName": "BRITANNIA-----THIN 40/",
    "salePrice": 720,
    "purchasePrice": 700,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 58,
    "itemName": "BRITANNIA----MARIE GOLD--10/*",
    "salePrice": 430,
    "purchasePrice": 410,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 59,
    "itemName": "BRITANNIA----MARIE GOLD--10/***",
    "salePrice": 9,
    "purchasePrice": 8.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 60,
    "itemName": "BTITANNIA****GOL MAAL30/**",
    "salePrice": 26.5,
    "purchasePrice": 24.5,
    "stockQuantity": -10,
    "stockValue": 0
  },
  {
    "slNo": 61,
    "itemName": "CACK 5/*",
    "salePrice": 4.35,
    "purchasePrice": 4.25,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 62,
    "itemName": "CAMEL COLOUR-10/",
    "salePrice": 8,
    "purchasePrice": 6.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 63,
    "itemName": "CANDAL 10/",
    "salePrice": 8,
    "purchasePrice": 7,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 64,
    "itemName": "CANDAL 30/**",
    "salePrice": 24,
    "purchasePrice": 20,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 65,
    "itemName": "CANDAL**",
    "salePrice": 4,
    "purchasePrice": 3.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 66,
    "itemName": "CARIM BISCUIT--5/***",
    "salePrice": 50,
    "purchasePrice": 45,
    "stockQuantity": -12,
    "stockValue": 0
  },
  {
    "slNo": 67,
    "itemName": "Cash",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 68,
    "itemName": "CATCH BLACK SALT",
    "salePrice": 45,
    "purchasePrice": 42,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 69,
    "itemName": "CELLO GRAIPPER-PEN",
    "salePrice": 7.5,
    "purchasePrice": 6,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 70,
    "itemName": "CENTER FRESH",
    "salePrice": 200,
    "purchasePrice": 192,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 71,
    "itemName": "CENTER FRUT 1/",
    "salePrice": 185,
    "purchasePrice": 180,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 72,
    "itemName": "CHAARIA FOL",
    "salePrice": 150,
    "purchasePrice": 140,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 73,
    "itemName": "CHAMUS**",
    "salePrice": 40,
    "purchasePrice": 35,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 74,
    "itemName": "CHANA BAZA**",
    "salePrice": 130,
    "purchasePrice": 120,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 75,
    "itemName": "CHANA DAL**",
    "salePrice": 85,
    "purchasePrice": 80,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 76,
    "itemName": "CHANA**",
    "salePrice": 89,
    "purchasePrice": 86.75,
    "stockQuantity": -31.5,
    "stockValue": 0
  },
  {
    "slNo": 77,
    "itemName": "CHAPOR",
    "salePrice": 1230,
    "purchasePrice": 1200,
    "stockQuantity": -13,
    "stockValue": 0
  },
  {
    "slNo": 78,
    "itemName": "CHIPS 5/ BANDIL",
    "salePrice": 80,
    "purchasePrice": 78,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 79,
    "itemName": "CHIPS 5/**",
    "salePrice": 4.3,
    "purchasePrice": 4.25,
    "stockQuantity": -585,
    "stockValue": 0
  },
  {
    "slNo": 80,
    "itemName": "CHIPS-24PCE 5/",
    "salePrice": 80,
    "purchasePrice": 75,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 81,
    "itemName": "CHIRA**",
    "salePrice": 45,
    "purchasePrice": 41,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 82,
    "itemName": "CHUN LOSE**",
    "salePrice": 35,
    "purchasePrice": 30,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 83,
    "itemName": "CHUN LQ",
    "salePrice": 8,
    "purchasePrice": 7,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 84,
    "itemName": "CHUN-9KG",
    "salePrice": 275,
    "purchasePrice": 260,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 85,
    "itemName": "CLEAR HAIR OIL-73",
    "salePrice": 69,
    "purchasePrice": 66,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 86,
    "itemName": "COCONUT 10/**",
    "salePrice": 9,
    "purchasePrice": 8.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 87,
    "itemName": "COCONUT OIL 20/*",
    "salePrice": 18,
    "purchasePrice": 17,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 88,
    "itemName": "COFFIE CUP 100 ML",
    "salePrice": 45,
    "purchasePrice": 40,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 89,
    "itemName": "COFFIE CUP 60-50 ML",
    "salePrice": 32.5,
    "purchasePrice": 30,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 90,
    "itemName": "COLGATE -10/",
    "salePrice": 108,
    "purchasePrice": 108,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 91,
    "itemName": "COLGATE*20/",
    "salePrice": 216,
    "purchasePrice": 210,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 92,
    "itemName": "CORN PLAKES",
    "salePrice": 54,
    "purchasePrice": 50,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 93,
    "itemName": "DABUR LAL 10/*",
    "salePrice": 9.25,
    "purchasePrice": 8.5,
    "stockQuantity": -24,
    "stockValue": 0
  },
  {
    "slNo": 94,
    "itemName": "DABUR AMLA 53*",
    "salePrice": 49,
    "purchasePrice": 47,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 95,
    "itemName": "DABUR SPECIAL OIL -47/",
    "salePrice": 52,
    "purchasePrice": 48,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 96,
    "itemName": "DALD. 100 GM",
    "salePrice": 16,
    "purchasePrice": 12.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 97,
    "itemName": "DALDA**",
    "salePrice": 130,
    "purchasePrice": 120,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 98,
    "itemName": "DALDA15KG",
    "salePrice": 2325,
    "purchasePrice": 2280,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 99,
    "itemName": "DALMUT 1NO-",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": -11,
    "stockValue": 0
  },
  {
    "slNo": 100,
    "itemName": "DALMUT 700GM",
    "salePrice": 65,
    "purchasePrice": 60,
    "stockQuantity": -13,
    "stockValue": 0
  },
  {
    "slNo": 101,
    "itemName": "DELIGHT ACHAR--1/***",
    "salePrice": 65,
    "purchasePrice": 62,
    "stockQuantity": -9,
    "stockValue": 0
  },
  {
    "slNo": 102,
    "itemName": "DETTOL SOAP-10/**",
    "salePrice": 9.25,
    "purchasePrice": 9,
    "stockQuantity": -102,
    "stockValue": 0
  },
  {
    "slNo": 103,
    "itemName": "DHOOP BATHI-20/",
    "salePrice": 200,
    "purchasePrice": 190,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 104,
    "itemName": "DHUNA**",
    "salePrice": 140,
    "purchasePrice": 130,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 105,
    "itemName": "DIAMOND CHIPS-5/",
    "salePrice": 4.3,
    "purchasePrice": 4.2,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 106,
    "itemName": "DIM(210PCE)",
    "salePrice": 1450,
    "purchasePrice": 1400,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 107,
    "itemName": "DIM** PATA",
    "salePrice": 215,
    "purchasePrice": 200,
    "stockQuantity": -14,
    "stockValue": 0
  },
  {
    "slNo": 108,
    "itemName": "ENGINE OIL 5 LTRS",
    "salePrice": 1150,
    "purchasePrice": 1120,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 109,
    "itemName": "ENGINE 100ML",
    "salePrice": 28,
    "purchasePrice": 27,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 110,
    "itemName": "ENGINE OIL ----1LTRS**",
    "salePrice": 229,
    "purchasePrice": 224.5,
    "stockQuantity": -28,
    "stockValue": 0
  },
  {
    "slNo": 111,
    "itemName": "ENGINE OIL --.200ML**",
    "salePrice": 54,
    "purchasePrice": 51,
    "stockQuantity": -21,
    "stockValue": 0
  },
  {
    "slNo": 112,
    "itemName": "ENGINE OIL 500ML**",
    "salePrice": 119,
    "purchasePrice": 114.5,
    "stockQuantity": -86,
    "stockValue": 0
  },
  {
    "slNo": 113,
    "itemName": "ENGINE OIL 50ML**",
    "salePrice": 18.5,
    "purchasePrice": 18,
    "stockQuantity": -18,
    "stockValue": 0
  },
  {
    "slNo": 114,
    "itemName": "ENGINE TOP REFINED 1LTRS**",
    "salePrice": 165,
    "purchasePrice": 155,
    "stockQuantity": -10,
    "stockValue": 0
  },
  {
    "slNo": 115,
    "itemName": "EV AMUL 10/",
    "salePrice": 110,
    "purchasePrice": 107,
    "stockQuantity": -13,
    "stockValue": 0
  },
  {
    "slNo": 116,
    "itemName": "EV AMUL 100GM",
    "salePrice": 66,
    "purchasePrice": 63.5,
    "stockQuantity": -15,
    "stockValue": 0
  },
  {
    "slNo": 117,
    "itemName": "EV AMUL 200GM",
    "salePrice": 125,
    "purchasePrice": 120,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 118,
    "itemName": "EVEREADY",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 119,
    "itemName": "EVEREADY 15/-- BATTERY",
    "salePrice": 125,
    "purchasePrice": 115,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 120,
    "itemName": "FAIR LOVELY 10/*",
    "salePrice": 220,
    "purchasePrice": 210,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 121,
    "itemName": "FAIR LOVELY-70/",
    "salePrice": 66,
    "purchasePrice": 64,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 122,
    "itemName": "FEVIKWIK 10/",
    "salePrice": 100,
    "purchasePrice": 92,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 123,
    "itemName": "FINGAR",
    "salePrice": 70,
    "purchasePrice": 65,
    "stockQuantity": -0.25,
    "stockValue": 0
  },
  {
    "slNo": 124,
    "itemName": "FLAKE",
    "salePrice": 83,
    "purchasePrice": 81,
    "stockQuantity": -82,
    "stockValue": 0
  },
  {
    "slNo": 125,
    "itemName": "FLAKE 50 PEG",
    "salePrice": 4100,
    "purchasePrice": 4050,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 126,
    "itemName": "FLASH",
    "salePrice": 17,
    "purchasePrice": 16,
    "stockQuantity": -45,
    "stockValue": 0
  },
  {
    "slNo": 127,
    "itemName": "FREE SUN R HALDI 50GM-100GM**",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 128,
    "itemName": "GASLIGHT- 10/",
    "salePrice": 8,
    "purchasePrice": 7,
    "stockQuantity": -42,
    "stockValue": 0
  },
  {
    "slNo": 129,
    "itemName": "GHEE 100 ML",
    "salePrice": 99,
    "purchasePrice": 90,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 130,
    "itemName": "GHEE 20/",
    "salePrice": 15,
    "purchasePrice": 12,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 131,
    "itemName": "GHEE 50GM",
    "salePrice": 42,
    "purchasePrice": 39,
    "stockQuantity": -25,
    "stockValue": 0
  },
  {
    "slNo": 132,
    "itemName": "GHEE. 799/* 1 KG",
    "salePrice": 770,
    "purchasePrice": 740,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 133,
    "itemName": "GLASH 65ML",
    "salePrice": 50,
    "purchasePrice": 40,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 134,
    "itemName": "GOLD FLAKE",
    "salePrice": 130,
    "purchasePrice": 125,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 135,
    "itemName": "GOLDAEN BAKR MARIE 20/",
    "salePrice": 17,
    "purchasePrice": 15,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 136,
    "itemName": "GOLDEN MARIE (20PEG/****-20/)",
    "salePrice": 325,
    "purchasePrice": 300,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 137,
    "itemName": "GUW MURI**",
    "salePrice": 130,
    "purchasePrice": 100,
    "stockQuantity": -16,
    "stockValue": 0
  },
  {
    "slNo": 138,
    "itemName": "HAJMOLA",
    "salePrice": 160,
    "purchasePrice": 150,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 139,
    "itemName": "HERMONI SOAP 10/",
    "salePrice": 9,
    "purchasePrice": 7,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 140,
    "itemName": "HIRMONI SOAP-10/",
    "salePrice": 9,
    "purchasePrice": 8,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 141,
    "itemName": "HIST 400GM",
    "salePrice": 230,
    "purchasePrice": 215,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 142,
    "itemName": "INEDEPENDENCE-WATER750ML**-CASE",
    "salePrice": 140,
    "purchasePrice": 133,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 143,
    "itemName": "JASMIN -48/",
    "salePrice": 44,
    "purchasePrice": 42,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 144,
    "itemName": "JASMINE OIL 20/",
    "salePrice": 19,
    "purchasePrice": 18,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 145,
    "itemName": "JUBIR BIRI HAJAR",
    "salePrice": 270,
    "purchasePrice": 260,
    "stockQuantity": -2.5,
    "stockValue": 0
  },
  {
    "slNo": 146,
    "itemName": "KABULI CHANA",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 147,
    "itemName": "KAD PENCILS",
    "salePrice": 45,
    "purchasePrice": 40,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 148,
    "itemName": "KAJU BADAM**",
    "salePrice": 900,
    "purchasePrice": 800,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 149,
    "itemName": "KAJUR. 500 GM",
    "salePrice": 210,
    "purchasePrice": 200,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 150,
    "itemName": "KAKA SAD",
    "salePrice": 250,
    "purchasePrice": 235,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 151,
    "itemName": "KALA PATA TAL",
    "salePrice": 25,
    "purchasePrice": 22,
    "stockQuantity": -25,
    "stockValue": 0
  },
  {
    "slNo": 152,
    "itemName": "KALAR CANDAL 5/",
    "salePrice": 115,
    "purchasePrice": 105,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 153,
    "itemName": "KALI DAL",
    "salePrice": 130,
    "purchasePrice": 130,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 154,
    "itemName": "KALI JEERA**",
    "salePrice": 265,
    "purchasePrice": 255,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 155,
    "itemName": "KALNA",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 156,
    "itemName": "KAPI GOLD PAN MASALA",
    "salePrice": 195,
    "purchasePrice": 192,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 157,
    "itemName": "KARBUL(25PEG)",
    "salePrice": 70,
    "purchasePrice": 60,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 158,
    "itemName": "KARI BAG BLACK",
    "salePrice": 140,
    "purchasePrice": 130,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 159,
    "itemName": "KARI BAG WH",
    "salePrice": 180,
    "purchasePrice": 165,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 160,
    "itemName": "Kas",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 161,
    "itemName": "KASHMIRI MIRCH 50 GM",
    "salePrice": 50,
    "purchasePrice": 48,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 162,
    "itemName": "KHATA-10/",
    "salePrice": 7.5,
    "purchasePrice": 6.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 163,
    "itemName": "KHATA-20/",
    "salePrice": 15,
    "purchasePrice": 13,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 164,
    "itemName": "KHATA-6/1",
    "salePrice": 250,
    "purchasePrice": 220,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 165,
    "itemName": "KHATA-6/8",
    "salePrice": 340,
    "purchasePrice": 310,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 166,
    "itemName": "KISMIS 1KG",
    "salePrice": 270,
    "purchasePrice": 265,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 167,
    "itemName": "L C",
    "salePrice": 15,
    "purchasePrice": 0,
    "stockQuantity": -9,
    "stockValue": 0
  },
  {
    "slNo": 168,
    "itemName": "LACHCHA SEMAI 40/**",
    "salePrice": 35,
    "purchasePrice": 32,
    "stockQuantity": -10,
    "stockValue": 0
  },
  {
    "slNo": 169,
    "itemName": "LAL MOTAR**",
    "salePrice": 65,
    "purchasePrice": 65,
    "stockQuantity": -7,
    "stockValue": 0
  },
  {
    "slNo": 170,
    "itemName": "LASER BALIT",
    "salePrice": 75,
    "purchasePrice": 70,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 171,
    "itemName": "LIFEBUOY SOAP-10/**",
    "salePrice": 9.25,
    "purchasePrice": 9,
    "stockQuantity": -12,
    "stockValue": 0
  },
  {
    "slNo": 172,
    "itemName": "LOLLIPOP**-1/",
    "salePrice": 50,
    "purchasePrice": 48,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 173,
    "itemName": "LONG-",
    "salePrice": 1500,
    "purchasePrice": 1200,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 174,
    "itemName": "LUX 40/* BANDIL",
    "salePrice": 95,
    "purchasePrice": 90,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 175,
    "itemName": "LUX SOAP -10/**",
    "salePrice": 9.25,
    "purchasePrice": 9,
    "stockQuantity": -84,
    "stockValue": 0
  },
  {
    "slNo": 176,
    "itemName": "MAGI 10/",
    "salePrice": 112,
    "purchasePrice": 110,
    "stockQuantity": -22,
    "stockValue": 0
  },
  {
    "slNo": 177,
    "itemName": "MAHAKOSH OIL-750ML",
    "salePrice": 115,
    "purchasePrice": 112,
    "stockQuantity": -32,
    "stockValue": 0
  },
  {
    "slNo": 178,
    "itemName": "MAIDA",
    "salePrice": 1895,
    "purchasePrice": 1867,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 179,
    "itemName": "MAIDA**",
    "salePrice": 38,
    "purchasePrice": 36,
    "stockQuantity": -47,
    "stockValue": 0
  },
  {
    "slNo": 180,
    "itemName": "MALKIST BISCUIT 45/*",
    "salePrice": 40,
    "purchasePrice": 38,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 181,
    "itemName": "MAMA -G",
    "salePrice": 50,
    "purchasePrice": 45,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 182,
    "itemName": "MANDIR DHOOP BATHI 10/",
    "salePrice": 100,
    "purchasePrice": 90,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 183,
    "itemName": "MASOOR DAL**",
    "salePrice": 79,
    "purchasePrice": 75.25,
    "stockQuantity": -112,
    "stockValue": 0
  },
  {
    "slNo": 184,
    "itemName": "MAST OIL 1LTRS",
    "salePrice": 129,
    "purchasePrice": 125,
    "stockQuantity": -40,
    "stockValue": 0
  },
  {
    "slNo": 185,
    "itemName": "MAST OIL 200ML",
    "salePrice": 29,
    "purchasePrice": 28,
    "stockQuantity": -49,
    "stockValue": 0
  },
  {
    "slNo": 186,
    "itemName": "MAST OIL 500ML**",
    "salePrice": 66.5,
    "purchasePrice": 64,
    "stockQuantity": -90,
    "stockValue": 0
  },
  {
    "slNo": 187,
    "itemName": "MATHI**",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": -2.1,
    "stockValue": 0
  },
  {
    "slNo": 188,
    "itemName": "MATHIPATA 30/-",
    "salePrice": 27,
    "purchasePrice": 25,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 189,
    "itemName": "MILK N NUT 1/*",
    "salePrice": 200,
    "purchasePrice": 180,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 190,
    "itemName": "MIMI 5/",
    "salePrice": 200,
    "purchasePrice": 190,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 191,
    "itemName": "MIRCHI 5KG",
    "salePrice": 950,
    "purchasePrice": 980,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 192,
    "itemName": "MIRCHI-10/",
    "salePrice": 320,
    "purchasePrice": 300,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 193,
    "itemName": "Mis",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 194,
    "itemName": "MISTI 1KG",
    "salePrice": 95,
    "purchasePrice": 88,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 195,
    "itemName": "MITHAI MATE 200 GM",
    "salePrice": 64.5,
    "purchasePrice": 63,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 196,
    "itemName": "MODUR",
    "salePrice": 73,
    "purchasePrice": 70,
    "stockQuantity": -10.44,
    "stockValue": 0
  },
  {
    "slNo": 197,
    "itemName": "MOON CHIPES",
    "salePrice": 90,
    "purchasePrice": 85,
    "stockQuantity": -19,
    "stockValue": 0
  },
  {
    "slNo": 198,
    "itemName": "MOONG DAL**",
    "salePrice": 90,
    "purchasePrice": 82,
    "stockQuantity": -11,
    "stockValue": 0
  },
  {
    "slNo": 199,
    "itemName": "MOSAR DHOOP",
    "salePrice": 75,
    "purchasePrice": 70,
    "stockQuantity": -16,
    "stockValue": 0
  },
  {
    "slNo": 200,
    "itemName": "MOTAR BAZA**",
    "salePrice": 90,
    "purchasePrice": 75,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 201,
    "itemName": "MOTAR**",
    "salePrice": 63,
    "purchasePrice": 59,
    "stockQuantity": -23.5,
    "stockValue": 0
  },
  {
    "slNo": 202,
    "itemName": "MURI RICE 50KG",
    "salePrice": 2175,
    "purchasePrice": 2137.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 203,
    "itemName": "MURI-(300peg)-10/",
    "salePrice": 300,
    "purchasePrice": 270,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 204,
    "itemName": "MURI-10/**",
    "salePrice": 7.5,
    "purchasePrice": 6,
    "stockQuantity": -10,
    "stockValue": 0
  },
  {
    "slNo": 205,
    "itemName": "N K SALT 25KG",
    "salePrice": 200,
    "purchasePrice": 180,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 206,
    "itemName": "NASIR BARI(40+Peg)",
    "salePrice": 870,
    "purchasePrice": 850,
    "stockQuantity": -12.25,
    "stockValue": 0
  },
  {
    "slNo": 207,
    "itemName": "NASIR BARI--+-(25+ SULA)",
    "salePrice": 21,
    "purchasePrice": 20,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 208,
    "itemName": "NAVRATNA OIL 50 ML",
    "salePrice": 44,
    "purchasePrice": 42,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 209,
    "itemName": "NIHAR HAIR OIL-20/",
    "salePrice": 19,
    "purchasePrice": 18,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 210,
    "itemName": "NIHAR-100ML",
    "salePrice": 42,
    "purchasePrice": 39,
    "stockQuantity": -12,
    "stockValue": 0
  },
  {
    "slNo": 211,
    "itemName": "NIMBOO PANI 10/",
    "salePrice": 190,
    "purchasePrice": 185,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 212,
    "itemName": "NOKUL-1Kg",
    "salePrice": 65,
    "purchasePrice": 62,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 213,
    "itemName": "NUKA BATI",
    "salePrice": 35,
    "purchasePrice": 30,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 214,
    "itemName": "ONION**",
    "salePrice": 53,
    "purchasePrice": 52,
    "stockQuantity": -302.1,
    "stockValue": 0
  },
  {
    "slNo": 215,
    "itemName": "PANEER 400ML",
    "salePrice": 104,
    "purchasePrice": 97,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 216,
    "itemName": "PANEER200ML",
    "salePrice": 55,
    "purchasePrice": 52,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 217,
    "itemName": "PANNER 1 KG",
    "salePrice": 180,
    "purchasePrice": 170,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 218,
    "itemName": "PAPAD PINK 200 G M",
    "salePrice": 57,
    "purchasePrice": 64,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 219,
    "itemName": "Papad PINK 500 GM",
    "salePrice": 140,
    "purchasePrice": 135,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 220,
    "itemName": "PAPAD**",
    "salePrice": 35,
    "purchasePrice": 30,
    "stockQuantity": -13,
    "stockValue": 0
  },
  {
    "slNo": 221,
    "itemName": "PAPAR K",
    "salePrice": 35,
    "purchasePrice": 0,
    "stockQuantity": -21,
    "stockValue": 0
  },
  {
    "slNo": 222,
    "itemName": "PAPER**",
    "salePrice": 50,
    "purchasePrice": 40,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 223,
    "itemName": "PARACHUTE COCONATOIL 68/ 75M L",
    "salePrice": 65,
    "purchasePrice": 63,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 224,
    "itemName": "PARACHUTE COCONUT **OIL 105/*175 M L",
    "salePrice": 85,
    "purchasePrice": 77,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 225,
    "itemName": "PARLA -G 5/*",
    "salePrice": 70,
    "purchasePrice": 68,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 226,
    "itemName": "PARLA G 10/**",
    "salePrice": 9,
    "purchasePrice": 8.75,
    "stockQuantity": -72,
    "stockValue": 0
  },
  {
    "slNo": 227,
    "itemName": "PARLA HAPPY HAPPY-24 PIC-5/",
    "salePrice": 110,
    "purchasePrice": 105,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 228,
    "itemName": "PASPURAN 10/* KG",
    "salePrice": 140,
    "purchasePrice": 120,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 229,
    "itemName": "PAYES BATI",
    "salePrice": 70,
    "purchasePrice": 50,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 230,
    "itemName": "PEN-(6PCE)----*25/",
    "salePrice": 20,
    "purchasePrice": 17,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 231,
    "itemName": "PLAM OIL 15LTRS TIN",
    "salePrice": 2190,
    "purchasePrice": 1930,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 232,
    "itemName": "POLIPOB",
    "salePrice": 260,
    "purchasePrice": 250,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 233,
    "itemName": "POLIPOB**",
    "salePrice": 180,
    "purchasePrice": 160,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 234,
    "itemName": "PONDS POWER 10/",
    "salePrice": 198,
    "purchasePrice": 192,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 235,
    "itemName": "PORIMAL RICE**",
    "salePrice": 32,
    "purchasePrice": 30.55,
    "stockQuantity": -50,
    "stockValue": 0
  },
  {
    "slNo": 236,
    "itemName": "POTATO F",
    "salePrice": 19,
    "purchasePrice": 16.5,
    "stockQuantity": -794.5,
    "stockValue": 0
  },
  {
    "slNo": 237,
    "itemName": "POTATO**",
    "salePrice": 18,
    "purchasePrice": 0,
    "stockQuantity": -60,
    "stockValue": 0
  },
  {
    "slNo": 238,
    "itemName": "Pra",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 239,
    "itemName": "PRAN ICE CROP-5/*",
    "salePrice": 180,
    "purchasePrice": 170,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 240,
    "itemName": "PRAN JELY 5/",
    "salePrice": 150,
    "purchasePrice": 140,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 241,
    "itemName": "PRAN LITCHU 12 PC 10/",
    "salePrice": 110,
    "purchasePrice": 100,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 242,
    "itemName": "PRAN TOASE 50/**",
    "salePrice": 42,
    "purchasePrice": 38,
    "stockQuantity": -20,
    "stockValue": 0
  },
  {
    "slNo": 243,
    "itemName": "PULSE CHOKLET",
    "salePrice": 160,
    "purchasePrice": 150,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 244,
    "itemName": "PUSKA-1KG",
    "salePrice": 80,
    "purchasePrice": 75,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 245,
    "itemName": "RAJA TEA 100GM",
    "salePrice": 285,
    "purchasePrice": 277,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 246,
    "itemName": "RAJA TEA 50GM",
    "salePrice": 285,
    "purchasePrice": 280,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 247,
    "itemName": "RED ROSE RICE**",
    "salePrice": 40,
    "purchasePrice": 39.25,
    "stockQuantity": -26,
    "stockValue": 0
  },
  {
    "slNo": 248,
    "itemName": "REFINE. 200 M L",
    "salePrice": 33,
    "purchasePrice": 31,
    "stockQuantity": -30,
    "stockValue": 0
  },
  {
    "slNo": 249,
    "itemName": "REFINED 500ML**",
    "salePrice": 71.5,
    "purchasePrice": 67,
    "stockQuantity": -84,
    "stockValue": 0
  },
  {
    "slNo": 250,
    "itemName": "REFINER 1LTRS**",
    "salePrice": 135,
    "purchasePrice": 130,
    "stockQuantity": -60,
    "stockValue": 0
  },
  {
    "slNo": 251,
    "itemName": "RICE RAJ RANI 26 KG",
    "salePrice": 1180,
    "purchasePrice": 1150,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 252,
    "itemName": "ROSI*",
    "salePrice": 140,
    "purchasePrice": 130,
    "stockQuantity": -1.49,
    "stockValue": 0
  },
  {
    "slNo": 253,
    "itemName": "ROSUN**",
    "salePrice": 135,
    "purchasePrice": 120,
    "stockQuantity": -13,
    "stockValue": 0
  },
  {
    "slNo": 254,
    "itemName": "RUCHI RICE 500ML",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 255,
    "itemName": "S N T RICE**",
    "salePrice": 40,
    "purchasePrice": 35,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 256,
    "itemName": "SADA **",
    "salePrice": 215,
    "purchasePrice": 200,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 257,
    "itemName": "SAGO 400GM",
    "salePrice": 60,
    "purchasePrice": 55,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 258,
    "itemName": "SAGO LOSE**",
    "salePrice": 70,
    "purchasePrice": 65,
    "stockQuantity": -9.4,
    "stockValue": 0
  },
  {
    "slNo": 259,
    "itemName": "Sahid",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 260,
    "itemName": "SALT -50KG",
    "salePrice": 375,
    "purchasePrice": 350,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 261,
    "itemName": "SALT 10/**",
    "salePrice": 10,
    "purchasePrice": 8,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 262,
    "itemName": "SARSO",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": -1.5,
    "stockValue": 0
  },
  {
    "slNo": 263,
    "itemName": "SATI FOOD ***-200GM",
    "salePrice": 50,
    "purchasePrice": 45,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 264,
    "itemName": "SAVAN 500GM**BOLL****KG",
    "salePrice": 70,
    "purchasePrice": 62,
    "stockQuantity": -13,
    "stockValue": 0
  },
  {
    "slNo": 265,
    "itemName": "SAVAN DUTTA KG",
    "salePrice": 95,
    "purchasePrice": 90,
    "stockQuantity": -15.5,
    "stockValue": 0
  },
  {
    "slNo": 266,
    "itemName": "SEAT SAVAN-100/",
    "salePrice": 80,
    "purchasePrice": 70,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 267,
    "itemName": "SEAT SAVAN10/",
    "salePrice": 27,
    "purchasePrice": 24,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 268,
    "itemName": "SETHJI OIL --500ML**",
    "salePrice": 208,
    "purchasePrice": 205,
    "stockQuantity": -60,
    "stockValue": 0
  },
  {
    "slNo": 269,
    "itemName": "SETHJI OIL* --1LTRS**",
    "salePrice": 209,
    "purchasePrice": 205,
    "stockQuantity": -27,
    "stockValue": 0
  },
  {
    "slNo": 270,
    "itemName": "SEWAI-15/**",
    "salePrice": 11,
    "purchasePrice": 9,
    "stockQuantity": -20,
    "stockValue": 0
  },
  {
    "slNo": 271,
    "itemName": "SEWAI-5/",
    "salePrice": 45,
    "purchasePrice": 38,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 272,
    "itemName": "SHAMPOO CLINIC-PLUS-1/**",
    "salePrice": 0.85,
    "purchasePrice": 0.8,
    "stockQuantity": -500,
    "stockValue": 0
  },
  {
    "slNo": 273,
    "itemName": "Shik",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 274,
    "itemName": "SHIKHAR PAN MASALA",
    "salePrice": 210,
    "purchasePrice": 205,
    "stockQuantity": -22,
    "stockValue": 0
  },
  {
    "slNo": 275,
    "itemName": "SHOW MIN",
    "salePrice": 25,
    "purchasePrice": 22,
    "stockQuantity": -5,
    "stockValue": 0
  },
  {
    "slNo": 276,
    "itemName": "SIGGNATURE",
    "salePrice": 440,
    "purchasePrice": 430,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 277,
    "itemName": "SIRKA -25/",
    "salePrice": 20,
    "purchasePrice": 18,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 278,
    "itemName": "SOAN**PAPDI",
    "salePrice": 200,
    "purchasePrice": 190,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 279,
    "itemName": "SOISHYO",
    "salePrice": 120,
    "purchasePrice": 110,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 280,
    "itemName": "SOYBIN",
    "salePrice": 80,
    "purchasePrice": 75,
    "stockQuantity": -15.75,
    "stockValue": 0
  },
  {
    "slNo": 281,
    "itemName": "SOYBIN 10/",
    "salePrice": 9,
    "purchasePrice": 8,
    "stockQuantity": -24,
    "stockValue": 0
  },
  {
    "slNo": 282,
    "itemName": "STIL BRASH 10/ PATA",
    "salePrice": 70,
    "purchasePrice": 55,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 283,
    "itemName": "SUDA**",
    "salePrice": 85,
    "purchasePrice": 80,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 284,
    "itemName": "SUGAR",
    "salePrice": 62,
    "purchasePrice": 58.5,
    "stockQuantity": -365.11,
    "stockValue": 0
  },
  {
    "slNo": 285,
    "itemName": "SUGAR CRACKERS BISCUIT+--20/",
    "salePrice": 17,
    "purchasePrice": 15,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 286,
    "itemName": "SUGAR CRACKERS.BISCUIT.+-- (20peg*20)",
    "salePrice": 330,
    "purchasePrice": 300,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 287,
    "itemName": "Suji 500 GM",
    "salePrice": 40,
    "purchasePrice": 30,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 288,
    "itemName": "SUJI 500GM",
    "salePrice": 40,
    "purchasePrice": 35,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 289,
    "itemName": "SUJI**",
    "salePrice": 42,
    "purchasePrice": 40,
    "stockQuantity": -7,
    "stockValue": 0
  },
  {
    "slNo": 290,
    "itemName": "SUN R COMBO 10/***",
    "salePrice": 6.67,
    "purchasePrice": 6,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 291,
    "itemName": "SUN R DONIA 100 GM",
    "salePrice": 300,
    "purchasePrice": 0,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 292,
    "itemName": "SUN R ELACHI 10/***",
    "salePrice": 8,
    "purchasePrice": 7.5,
    "stockQuantity": -20,
    "stockValue": 0
  },
  {
    "slNo": 293,
    "itemName": "SUN R GARAM MASLA 5/***",
    "salePrice": 3.67,
    "purchasePrice": 3.38,
    "stockQuantity": -60,
    "stockValue": 0
  },
  {
    "slNo": 294,
    "itemName": "SUN R HALDI -200GM**",
    "salePrice": 330,
    "purchasePrice": 310,
    "stockQuantity": -0.9,
    "stockValue": 0
  },
  {
    "slNo": 295,
    "itemName": "SUN R HALDI -500GM**",
    "salePrice": 330,
    "purchasePrice": 235,
    "stockQuantity": -1.5,
    "stockValue": 0
  },
  {
    "slNo": 296,
    "itemName": "SUN R HALDI 10/",
    "salePrice": 290,
    "purchasePrice": 270,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 297,
    "itemName": "SUN R HALDI 10/**",
    "salePrice": 300,
    "purchasePrice": 270,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 298,
    "itemName": "SUN R HALDI 100GM**",
    "salePrice": 330,
    "purchasePrice": 315,
    "stockQuantity": -9,
    "stockValue": 0
  },
  {
    "slNo": 299,
    "itemName": "SUN R HALDI 200GM**",
    "salePrice": 250,
    "purchasePrice": 235,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 300,
    "itemName": "SUN R HALDI 50GM**",
    "salePrice": 250,
    "purchasePrice": 228,
    "stockQuantity": -7,
    "stockValue": 0
  },
  {
    "slNo": 301,
    "itemName": "SUN R JEERA 100 G M",
    "salePrice": 550,
    "purchasePrice": 525,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 302,
    "itemName": "SUN R JEERA 500GM",
    "salePrice": 530,
    "purchasePrice": 500,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 303,
    "itemName": "SUN R JEERA 50GM",
    "salePrice": 500,
    "purchasePrice": 468,
    "stockQuantity": -3.7,
    "stockValue": 0
  },
  {
    "slNo": 304,
    "itemName": "SUN R JEERA-10/",
    "salePrice": 8,
    "purchasePrice": 7.5,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 305,
    "itemName": "SUN R MEAT MASLA-5/***",
    "salePrice": 3.67,
    "purchasePrice": 3.38,
    "stockQuantity": -70,
    "stockValue": 0
  },
  {
    "slNo": 306,
    "itemName": "SUN R MEAT***-MASLA 50GM",
    "salePrice": 40,
    "purchasePrice": 39,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 307,
    "itemName": "SUN R METHI PATA",
    "salePrice": 30,
    "purchasePrice": 20,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 308,
    "itemName": "SUN R MIRCHI 10/*",
    "salePrice": 8,
    "purchasePrice": 7.5,
    "stockQuantity": -60,
    "stockValue": 0
  },
  {
    "slNo": 309,
    "itemName": "SUN R MIRCHI 200GM**",
    "salePrice": 500,
    "purchasePrice": 462.5,
    "stockQuantity": -1.7,
    "stockValue": 0
  },
  {
    "slNo": 310,
    "itemName": "SUN R MIRCHI 500GM**",
    "salePrice": 500,
    "purchasePrice": 457.9,
    "stockQuantity": -1.5,
    "stockValue": 0
  },
  {
    "slNo": 311,
    "itemName": "SUN R MIRCHI 50GM**",
    "salePrice": 500,
    "purchasePrice": 467.25,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 312,
    "itemName": "SUN R MIRCHI-100GM**",
    "salePrice": 350,
    "purchasePrice": 328,
    "stockQuantity": -12,
    "stockValue": 0
  },
  {
    "slNo": 313,
    "itemName": "SUN R PASPURAN-*10/",
    "salePrice": 8,
    "purchasePrice": 7.5,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 314,
    "itemName": "SUN R PASPURN-JEERA-AJWIN10/***",
    "salePrice": 7,
    "purchasePrice": 6.4,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 315,
    "itemName": "SURF 10/**",
    "salePrice": 9.25,
    "purchasePrice": 9,
    "stockQuantity": -64,
    "stockValue": 0
  },
  {
    "slNo": 316,
    "itemName": "SURF 120PEG **-10/",
    "salePrice": 1070,
    "purchasePrice": 1050,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 317,
    "itemName": "SURF 500GM",
    "salePrice": 71,
    "purchasePrice": 68,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 318,
    "itemName": "SURF BALTI 2 K G",
    "salePrice": 235,
    "purchasePrice": 220,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 319,
    "itemName": "Sw",
    "salePrice": 0,
    "purchasePrice": 0,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 320,
    "itemName": "SWASTIK RICE",
    "salePrice": 1200,
    "purchasePrice": 1159,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 321,
    "itemName": "SWEET SUPARI",
    "salePrice": 40,
    "purchasePrice": 38,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 322,
    "itemName": "Taaz BLADES",
    "salePrice": 40,
    "purchasePrice": 35,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 323,
    "itemName": "TAAZA 1LTRS**",
    "salePrice": 75,
    "purchasePrice": 73,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 324,
    "itemName": "TAAZA 200ML",
    "salePrice": 450,
    "purchasePrice": 440,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 325,
    "itemName": "TAAZA 200ML**",
    "salePrice": 15,
    "purchasePrice": 14.5,
    "stockQuantity": -6,
    "stockValue": 0
  },
  {
    "slNo": 326,
    "itemName": "TAAZA500ML**",
    "salePrice": 38,
    "purchasePrice": 36.5,
    "stockQuantity": -12,
    "stockValue": 0
  },
  {
    "slNo": 327,
    "itemName": "TAL MISRI 1KG-",
    "salePrice": 130,
    "purchasePrice": 120,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 328,
    "itemName": "TAR-22**",
    "salePrice": 110,
    "purchasePrice": 100,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 329,
    "itemName": "TATA I SHAKTI-*25KG.SALT",
    "salePrice": 300,
    "purchasePrice": 250,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 330,
    "itemName": "TATA MIRCHI 100 GM",
    "salePrice": 500,
    "purchasePrice": 390,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 331,
    "itemName": "TATA SALT 1KG**",
    "salePrice": 30,
    "purchasePrice": 27,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 332,
    "itemName": "TATA SALT**",
    "salePrice": 1370,
    "purchasePrice": 1300,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 333,
    "itemName": "TEA CH 100GM",
    "salePrice": 285,
    "purchasePrice": 277,
    "stockQuantity": -8,
    "stockValue": 0
  },
  {
    "slNo": 334,
    "itemName": "TEA CH 250GM",
    "salePrice": 285,
    "purchasePrice": 277,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 335,
    "itemName": "TEA CH 250GM**",
    "salePrice": 75,
    "purchasePrice": 65,
    "stockQuantity": -4,
    "stockValue": 0
  },
  {
    "slNo": 336,
    "itemName": "TEA LOSE",
    "salePrice": 170,
    "purchasePrice": 150,
    "stockQuantity": -7.5,
    "stockValue": 0
  },
  {
    "slNo": 337,
    "itemName": "TEZ BLADES 50 PC",
    "salePrice": 42.5,
    "purchasePrice": 38,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 338,
    "itemName": "TISU -PAPER",
    "salePrice": 21,
    "purchasePrice": 18,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 339,
    "itemName": "TOASE 10/",
    "salePrice": 200,
    "purchasePrice": 190,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 340,
    "itemName": "TOM TOM SCUC",
    "salePrice": 65,
    "purchasePrice": 60,
    "stockQuantity": -24,
    "stockValue": 0
  },
  {
    "slNo": 341,
    "itemName": "TOTO SAUCE",
    "salePrice": 60,
    "purchasePrice": 52,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 342,
    "itemName": "UJALA 5/*",
    "salePrice": 110,
    "purchasePrice": 105,
    "stockQuantity": -2,
    "stockValue": 0
  },
  {
    "slNo": 343,
    "itemName": "VALLEY 10/**",
    "salePrice": 8.5,
    "purchasePrice": 8,
    "stockQuantity": -20,
    "stockValue": 0
  },
  {
    "slNo": 344,
    "itemName": "VALLEY TEA **-100GM",
    "salePrice": 250,
    "purchasePrice": 230,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 345,
    "itemName": "VALLEY TEA 250GM",
    "salePrice": 250,
    "purchasePrice": 240,
    "stockQuantity": 0,
    "stockValue": 0
  },
  {
    "slNo": 346,
    "itemName": "VASOCARE JAR 5/*",
    "salePrice": 220,
    "purchasePrice": 210,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 347,
    "itemName": "VIM -5/",
    "salePrice": 55,
    "purchasePrice": 53,
    "stockQuantity": -1,
    "stockValue": 0
  },
  {
    "slNo": 348,
    "itemName": "VIM SOAP-10/**",
    "salePrice": 9.25,
    "purchasePrice": 9,
    "stockQuantity": -18,
    "stockValue": 0
  },
  {
    "slNo": 349,
    "itemName": "WATER 75ML15 PEC",
    "salePrice": 100,
    "purchasePrice": 90,
    "stockQuantity": -3,
    "stockValue": 0
  },
  {
    "slNo": 350,
    "itemName": "YELLOW KALAR",
    "salePrice": 75,
    "purchasePrice": 55,
    "stockQuantity": 0,
    "stockValue": 0
  }
];

const reportMeta = {
  title: "Stock Summary Report",
  sourceFile: "Stock_Summary_Report_03-11-2026.pdf",
  generatedOn: "2026-11-03T20:18:00",
  currency: "INR",
  totalRawItems: 350,
  validItems: 341,
  zeroPriceArtifactsRemoved: 9,
};

module.exports = {
  groceryStock,
  cleanedGroceryStock: groceryStock,
  rawGroceryStock,
  reportMeta,
  default: groceryStock,
};
