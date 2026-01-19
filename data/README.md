# Data Directory

This directory contains all data files used by the Asper Beauty Shop application.

## Directory Structure

```
data/
├── products/          # Product catalog data
│   └── products-data.xlsx    # Main product database
├── inventory/         # Inventory and stock data
│   └── materials-inventory-arabic.xlsx  # Materials inventory (16% availability, 1526 items)
└── exports/          # Generated reports and exports
```

## Data Files

### Products Data
- **File**: `products/products-data.xlsx`
- **Description**: Main product catalog containing all product information
- **Format**: Microsoft Excel 2007+ (.xlsx)
- **Location**: Also available in `public/data/` for web access
- **Usage**: Used by the bulk upload feature and product management

### Materials Inventory
- **File**: `inventory/materials-inventory-arabic.xlsx`
- **Description**: Arabic language materials inventory report
- **Format**: Microsoft Excel 2007+ (.xlsx)
- **Contents**: 1526 items with 16% availability status
- **Language**: Arabic
- **Usage**: Internal inventory tracking and management

## Data Management Guidelines

### Adding New Data Files
1. Place files in the appropriate subdirectory
2. Use descriptive, lowercase filenames with hyphens
3. Include language suffix if content is language-specific (e.g., `-arabic`, `-english`)
4. Update this README with file descriptions

### Data File Naming Convention
```
{category}-{description}-{language}.{extension}

Examples:
- products-catalog-english.xlsx
- inventory-materials-arabic.xlsx
- export-sales-report-2026-01.csv
```

### Security Notes
- **DO NOT** commit sensitive data (passwords, API keys, customer PII)
- Data files should contain only reference/catalog data
- Customer data should be stored in the database (Supabase)
- Use `.gitignore` to exclude sensitive exports

### Data Backup
- All data files are version-controlled in Git
- Database backups are handled by Supabase
- Export files in `exports/` are temporary and can be gitignored

## Related Documentation
- See `/docs/database-schema.md` for database structure
- See `/docs/api.md` for data access APIs
- See `CONTRIBUTING.md` for data contribution guidelines
