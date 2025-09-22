# 📋 GitHub Projects v2 Board Configuration

## Project Details
- **Name**: `merge-doglc-into-logic-workspace`
- **Visibility**: Public
- **Type**: Projects v2 (Beta)
- **Repository**: Chaiya88/doglc-digital-wallet

## Board Structure

### Columns
1. **Backlog** - Items that are identified but not yet ready to work on
2. **To do** - Items ready to be worked on, prioritized and scoped
3. **In progress** - Items currently being worked on
4. **Review** - Items completed and under review (PR/code review)
5. **Done** - Completed items

## Referenced Issue
- **Main Issue**: [logic-digital-wallet#4](https://github.com/Chaiya88/logic-digital-wallet/issues/4)
- **Title**: สร้าง Checklist การรวมข้อดีของทั้งสองรีโป (merge doglc-digital-wallet + logic-digital-wallet)

## Initial Cards

### 📝 README/Notes Card (Initial Setup)
**Title**: Project Overview and Guidelines  
**Content**: See `PROJECT_BOARD_README.md` for detailed content

### 🎯 Main Issue Reference Card
**Title**: Master Checklist - Merge Repository Benefits  
**Type**: Linked to issue  
**Link**: https://github.com/Chaiya88/logic-digital-wallet/issues/4  
**Column**: To do

### 📦 Sub-Issue Cards (Based on Issue #4 Checklist)

#### Category 1: File Migration/Consolidation
1. **Source Code Migration** 
   - Move core files from `src/` and `workers/` directories
   - Column: Backlog

2. **Production Configuration Integration**
   - Merge `orchestrator/` and production-ready/backup files
   - Column: Backlog

3. **Wrangler Configuration Consolidation**
   - Combine wrangler.toml files for staging+production
   - Column: Backlog

4. **Documentation and Scripts Integration**
   - Merge README, reports, and functional scripts
   - Column: Backlog

5. **Configuration Files Cleanup**
   - Review .gitignore, linter, prettier, env.example
   - Column: Backlog

#### Category 2: Security/Secrets Sanitization
6. **Sensitive Data Audit**
   - Scan and remove sensitive data from wrangler.toml files
   - Column: To do

7. **Secrets Migration to Cloudflare**
   - Move secrets to wrangler secret/Cloudflare Vault
   - Column: To do

8. **Git History Security Check**
   - Audit git history for leaked secrets
   - Column: To do

9. **Secret Rotation**
   - Rotate/change any previously leaked secrets
   - Column: To do

#### Category 3: PR Grouping Strategy
10. **PR#1: Core Structure**
    - Main files, src, workers, orchestrator
    - Column: Backlog

11. **PR#2: Production Config**
    - wrangler.toml, env, deploy scripts
    - Column: Backlog

12. **PR#3: Documentation**
    - README, examples, env templates
    - Column: Backlog

13. **PR#4: Cleanup**
    - Remove duplicate/deprecated files
    - Column: Backlog

14. **PR#5: Security Hardening**
    - Sanitize secrets, update .gitignore, policies
    - Column: Backlog

#### Category 4: System Integration
15. **Dependency Resolution**
    - Resolve package.json conflicts (wrangler, telegraf, jose)
    - Column: To do

16. **License Decision**
    - Decide between MIT vs PRIVATE license
    - Column: To do

17. **CI/CD Pipeline Setup**
    - Implement lint, build, test, wrangler dry-run
    - Column: Backlog

18. **README Update**
    - Update documentation for new structure
    - Column: Backlog

19. **Production Deployment Guide**
    - Add secrets usage and production deployment instructions
    - Column: Backlog

## Automation Rules

### Issue/PR Linking
- When an issue is opened → Move to "Backlog"
- When an issue is assigned → Move to "To do" 
- When a PR is opened for an issue → Move to "In progress"
- When a PR is approved → Move to "Review"
- When an issue is closed → Move to "Done"

### Status Transitions
- Items can be manually moved between columns
- Automation moves items based on issue/PR state changes
- Items in "Done" are automatically archived after 30 days

## Custom Fields (Optional)
- **Priority**: High, Medium, Low
- **Effort**: 1-5 (story points)
- **Category**: File Migration, Security, PR Strategy, System Integration
- **Assignee**: Team member responsible
- **Due Date**: Target completion date

## Setup Instructions

1. **Create the Project**:
   - Go to GitHub Projects: https://github.com/orgs/Chaiya88/projects
   - Click "New project" → "Board"
   - Name: `merge-doglc-into-logic-workspace`
   - Set visibility to "Public"

2. **Configure Columns**:
   - Add columns: Backlog, To do, In progress, Review, Done
   - Configure automation rules as specified above

3. **Add Initial Cards**:
   - Create cards based on the list above
   - Link the main issue from logic-digital-wallet#4
   - Add the README/Notes card with project overview

4. **Set Up Automation**:
   - Configure built-in automations for issue/PR state changes
   - Set up custom workflows using GitHub Actions (see `project-automation.yml`)

5. **Team Access**:
   - Add collaborators with appropriate permissions
   - Set up notifications for project updates

## Related Files
- `PROJECT_BOARD_README.md` - Content for the initial README card
- `project-automation.yml` - GitHub Actions workflow for automation
- `PROJECT_BOARD_TEMPLATE.json` - JSON template for project import (if supported)