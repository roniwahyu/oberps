# MASSET YPPIWM - Project Instructions

**Project**: Asset Management System Yayasan Pendidikan Perguruan Islam Widya Gama Malang  
**Stack**: PHP 7.4 + Laravel 5.8 + MySQL 5.7 + Bootstrap 5 + jQuery  
**Environment**: Laragon 6.0 (Windows Local Development)

---

## 🤖 Multi-Agent Project

This project is developed by **multiple AI agents**:
- **Kiro Agent** - Primary agent
- **Antigravity** - Secondary agent
- **Codex** - This agent

**All agents must follow the same guidelines from `.kiro/` directory** to ensure consistency.

---

## 🎯 Core Directive

You are maintaining and building features on a **legacy PHP stack** with **modern Bootstrap 5 UI**. All code must be 100% compatible with:
- **PHP 7.4** (NO PHP 8+ features)
- **Laravel 5.8** (NO modern Laravel features)
- **MySQL 5.7+** (NO MySQL 8+ exclusive features)
- **Bootstrap 5** (modern UI) + **jQuery 3.5+** (legacy interoperability)

---

## 📂 Project Guidelines Location

**All detailed guidelines are stored in `.kiro/` directory:**

### 1. Technology Stack & Constraints
📄 **File**: `.kiro/skills.md`

**Key Rules**:
- PHP 7.4 strict (no attributes, match expressions, union types, enums, nullsafe operator)
- Laravel 5.8 routing (string-based: `'Controller@method'`, no tuple syntax)
- MySQL 5.7 (no window functions, no CTEs)
- Bootstrap 5 classes + jQuery coexistence (DataTables, Chart.js, jquery-ui)
- Always verify Composer package compatibility before `composer require`

### 2. Behavioral Guidelines (Karpathy-Inspired)
📄 **File**: `.kiro/steering/karpathy-guidelines.md`

**Critical Rules**:
- ✅ **Think Before Coding** - State assumptions explicitly, ask if unclear
- ✅ **Simplicity First** - Minimum code, no speculation, no premature abstraction
- ✅ **Surgical Changes** - Touch only what's needed, match existing style
- 🔴 **NO REFACTORING WITHOUT ERRORS** - If it's not broken, don't fix it
- ✅ **Always Backup** - Format: `backups/<type>/<file>.bak_YYYYMMDD`
- ✅ **Verify Before Execute** - ALWAYS confirm understanding for major changes (>50 lines)

### 3. Smart Debugging Protocol
📄 **File**: `.kiro/skills/smart-debugging/SKILL.md`

**Debugging Layers** (ALWAYS start from Layer 1):
1. **Layer 1**: Syntax & File Dasar (check `<?php` first!)
2. **Layer 2**: Routing & Endpoint
3. **Layer 3**: Compare with working version
4. **Layer 4**: Log & Cache
5. **Layer 5**: Database & Model
6. **Layer 6**: Infrastructure (last resort)

**Never jump to Layer 4-6 before checking Layer 1-3!**

### 4. Safe File Editing Rules
📄 **File**: `.kiro/skills.md` (section: Safe File Editing)

**Golden Rules**:
- ⭐ **COMMENT, Don't DELETE** - Format: `// [YYYY-MM-DD | Inisial] reason`
- Always read entire file before editing
- Verify `<?php` exists after every PHP file edit
- Special care for `routes/web.php` - critical file!
- Never replace entire file when only adding lines

### 5. Reusable & Modular Paradigm
📄 **File**: `.kiro/skills.md` (section: Reusable & Modular)

**Design Principles**:
- Design all additions to be reusable across modules
- Prefer small pure helper functions over inline duplication
- Extract repeated CRUD/DataTables code into utilities
- Keep controllers thin - compose queries via reusable functions
- Use Blade partials for common UI blocks

---

## 🗂️ Project Structure

```
massetyppiwm/
├── .kiro/                    # All project guidelines (READ THESE!)
│   ├── skills.md             # Tech stack rules
│   ├── steering/
│   │   └── karpathy-guidelines.md
│   └── skills/
│       └── smart-debugging/
├── .Codex/                  # Codex config
│   ├── AGENTS.md            # This file (auto-loaded)
│   └── settings.local.json
├── core/                     # Laravel 5.8 application
│   ├── app/
│   │   └── Http/Controllers/
│   ├── routes/
│   │   └── web.php          # ⚠️ CRITICAL FILE - always verify after edit
│   ├── resources/
│   │   └── views/
│   └── database/
├── backups/                  # Physical backups (besides git)
│   ├── js/
│   ├── php/
│   ├── blade/
│   └── routes/
├── DEV_DOCS/                 # Development documentation
└── dataset/                  # Import datasets
```

---

## 🔧 Common Commands

```bash
# Laravel artisan (must run from core/)
cd core
php artisan route:list
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Database
mysql -u root -e "USE masset_updated; SHOW TABLES;"

# PHP syntax check
php -l path/to/file.php
```

---

## 🚨 Critical Files - Handle with Extra Care

### 1. `core/routes/web.php`
**Why Critical**: Single point of routing failure  
**After EVERY edit**:
- [ ] Line 1 is `<?php`
- [ ] Route `/` exists
- [ ] Route `/home` exists
- [ ] No page routes deleted

### 2. `core/app/Http/Controllers/` (any controller)
**After EVERY edit**:
- [ ] `<?php` exists at line 1
- [ ] Namespace correct
- [ ] No syntax errors: `php -l file.php`

### 3. `.env`
**Never commit!**  
**Current DB**: `masset_updated`

---

## 📝 Workflow for ANY Task

### Before Starting:
```
1. Read relevant .kiro/ guidelines
2. Understand the request fully
3. If major change (>50 lines), VERIFY understanding with user first
4. State your plan briefly
```

### During Implementation:
```
1. Backup files: backups/<type>/<file>.bak_YYYYMMDD
2. Read entire file before editing
3. Use surgical changes only
4. Comment old code, don't delete: // [YYYY-MM-DD | AI] reason
5. Verify <?php exists after edit
```

### After Implementation:
```
1. Test if possible (load page, check syntax)
2. Document in DEV_DOCS/ if significant
3. Verify no routes/features were accidentally deleted
```

---

## 🎯 Current Active Modules

### ✅ Asset Management (Complete)
- Controllers: Asset, Component, Maintenance
- Views: Bootstrap 5 modern UI
- DataTables with jQuery

### ✅ Inventory Management (Backend Complete - 2026-06-06)
- Controllers: InventoryItem, InventoryTransaction, InventoryRequisition, InventoryReport
- Routes: 60 routes configured
- Database: 4 tables deployed
- Views: 4 Blade templates created
- Status: **Ready for testing**
- Docs: `DEV_DOCS/367_inventory_api_mvc_audit_20260606.md`

### ⏳ Pending Integration
- RBAC permissions for Inventory module
- Sidebar menu for Inventory
- JavaScript validation (may be inline in views)

---

## ❗ Remember

1. **Simple First, Complex Last** - Start debugging from Layer 1
2. **If Not Broken, Don't Fix** - Stability > Perfection
3. **Verify Before Major Changes** - 5 minutes verification saves hours of rework
4. **Comment, Don't Delete** - Rollback must be instant
5. **PHP 7.4 / Laravel 5.8 Strict** - No modern features!

---

## 📚 Full Guidelines

For complete details, always refer to:
- `.kiro/skills.md` - Complete tech stack rules
- `.kiro/steering/karpathy-guidelines.md` - Complete behavioral guidelines
- `.kiro/skills/smart-debugging/SKILL.md` - Complete debugging protocol

---

**This file is auto-loaded every session. Guidelines in `.kiro/` are the source of truth.**

Last updated: 2026-06-07
