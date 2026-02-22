// Script to generate sample products Excel file
import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample product data
const products = [
  { "الرمز": "777284", "اسم المادة": "BLACK HAIR PINS", "الكلفة": 0.259, "سعر البيع": 0.500 },
  { "الرمز": "737383722396", "اسم المادة": "PALMERS OLIVE OIL COND 400 ML", "الكلفة": 4.487, "سعر البيع": 9.750 },
  { "الرمز": "737383722622", "اسم المادة": "PALMER-S OLIVE OIL BODY LOTION PUMP (400ML)", "الكلفة": 6.840, "سعر البيع": 10.000 },
  { "الرمز": "737383743893", "اسم المادة": "PALMERS COCOA BUTTER FORMULA BODY LOTION 400 ML", "الكلفة": 10.310, "سعر البيع": 14.950 },
  { "الرمز": "737383772223", "اسم المادة": "PALMERS SKINSUCCESS FADE CREAM (OILY SKIN) (75GM)", "الكلفة": 8.836, "سعر البيع": 15.950 },
  { "الرمز": "737383787772", "اسم المادة": "PALMERS SKIN SUCCESS DEEP CLEANSING (250 ML)", "الكلفة": 4.333, "سعر البيع": 9.500 },
  { "الرمز": "737768773629", "اسم المادة": "SUNDOWN PAPAYA ENZYME (100 CHEWABLE TAB)", "الكلفة": 9.600, "سعر البيع": 12.900 },
  { "الرمز": "764642727334", "اسم المادة": "JAMIESON VIT C 500 CHEWABLE (100+20TABLETS)", "الكلفة": 9.418, "سعر البيع": 13.900 },
  { "الرمز": "722277947238", "اسم المادة": "SPEED STICK OCEAN SURF (51G)", "الكلفة": 1.650, "سعر البيع": 2.750 },
  { "الرمز": "7447477", "اسم المادة": "ARTELAC ADVANCED E/D (30*0.5ML)", "الكلفة": 5.672, "سعر البيع": 8.630 },
  { "الرمز": "8901030703577", "اسم المادة": "HIMALAYA PURIFYING NEEM FACE WASH 150ML", "الكلفة": 3.500, "سعر البيع": 6.500 },
  { "الرمز": "3282770100068", "اسم المادة": "BIODERMA SENSIBIO H2O 250ML", "الكلفة": 12.500, "سعر البيع": 19.900 },
  { "الرمز": "3337875545778", "اسم المادة": "VICHY MINERAL 89 SERUM 50ML", "الكلفة": 28.000, "سعر البيع": 42.000 },
  { "الرمز": "4005808571109", "اسم المادة": "EUCERIN UREA REPAIR PLUS LOTION 250ML", "الكلفة": 15.000, "سعر البيع": 24.500 },
  { "الرمز": "302990364015", "اسم المادة": "CETAPHIL DAILY FACIAL CLEANSER 236ML", "الكلفة": 8.900, "سعر البيع": 14.500 },
  { "الرمز": "071249104392", "اسم المادة": "MAYBELLINE LASH SENSATIONAL MASCARA", "الكلفة": 7.200, "سعر البيع": 12.900 },
  { "الرمز": "3600531324582", "اسم المادة": "L'OREAL TRUE MATCH FOUNDATION 30ML", "الكلفة": 11.500, "سعر البيع": 18.900 },
  { "الرمز": "7290012937454", "اسم المادة": "MOROCCANOIL TREATMENT 100ML", "الكلفة": 35.000, "سعر البيع": 52.000 },
  { "الرمز": "896364002428", "اسم المادة": "OLAPLEX NO.3 HAIR PERFECTOR 100ML", "الكلفة": 22.000, "سعر البيع": 35.000 },
  { "الرمز": "5011417530368", "اسم المادة": "TRESEMME KERATIN SMOOTH SHAMPOO 500ML", "الكلفة": 4.200, "سعر البيع": 7.500 },
];

// Create worksheet
const worksheet = XLSX.utils.json_to_sheet(products);

// Create workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

// Ensure output directory exists
const outputDir = join(__dirname, '..', 'public', 'data');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Write to file
const outputPath = join(outputDir, 'products-data.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Created sample Excel file at: ${outputPath}`);
console.log(`Contains ${products.length} sample products`);
