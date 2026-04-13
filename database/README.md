# Database Schema and Scripts

This directory contains all SQL files organized by purpose for the Smart Dashboard for Financial Planning project.

## 📁 Directory Structure

### 🗂️ `migrations/`
Contains database schema definitions and migration files:
- `COMPLETE_DATABASE_SCHEMA.sql` - Full database schema with all tables
- `database_schema.sql` - Core database schema
- `SAFE_DATABASE_SCHEMA.sql` - Schema with safety constraints
- `schema.sql` - Original Supabase schema
- `001_initial_schema.sql` - Initial migration
- `002_budget_presets.sql` - Budget presets migration

### ⚙️ `setup/`
Contains setup scripts for initializing database features:
- `COMPLETE_GOALS_SETUP.sql` - Complete goals feature setup
- `GOALS_SETUP.sql` - Basic goals setup
- `INCOME_SETUP_CLEAN.sql` - Clean income tracking setup
- `INCOME_LOANS_SQL.sql` - Income and loans setup
- `REPORTS_SETUP.sql` - Reports feature setup
- `STORAGE_SETUP.sql` - Supabase storage buckets setup

### 🔧 `fixes/`
Contains SQL scripts for fixing database issues:
- `FIX_EXPENSE_CATEGORIES.sql` - Fix expense categories
- `FIX_FUNCTION.sql` - Function fixes
- `FIX_INVESTMENTS_RLS.sql` - Investment RLS fixes
- `IMMEDIATE_FIX.sql` - Immediate fixes
- `fix_excess_savings.sql` - Fix excess savings calculations

### 🛠️ `scripts/`
Contains utility and testing scripts:
- `TEST_CATEGORIES.sql` - Test categories data
- `debug_excess_savings.sql` - Debug savings calculations
- `setup-reports-storage.sql` - Setup reports storage

## 🚀 Usage

### Initial Setup
1. Run the migration files in order:
   ```sql
   -- Start with migrations/001_initial_schema.sql
   -- Then migrations/002_budget_presets.sql
   -- Finally use migrations/COMPLETE_DATABASE_SCHEMA.sql for full setup
   ```

2. Setup features using files from `setup/` directory as needed

3. Apply any necessary fixes from `fixes/` directory

### Development
- Use scripts in `scripts/` for testing and debugging
- Apply fixes from `fixes/` as issues are discovered
- Add new migration files to `migrations/` for schema changes

## 📋 Database Schema Overview

The database includes the following main entities:
- Users and authentication
- Accounts and transactions
- Goals and budgets
- Loans and credit cards
- Investments and holdings
- Reports and analytics
- Vault for encrypted storage
- AI insights and recommendations

## 🔒 Security Notes

- All tables implement Row-Level Security (RLS)
- Sensitive data is encrypted using AES-256-GCM
- PII is redacted before AI processing
- Access is controlled through Supabase Auth

## 📞 Support

For database-related issues, refer to the individual SQL file comments or create an issue in the main repository.
