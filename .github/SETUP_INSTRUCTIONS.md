# 🚀 Setup Instructions: GitHub Projects v2 Board

## Overview
This guide walks through creating the `merge-doglc-into-logic-workspace` project board manually, since GitHub Projects v2 doesn't support automated creation via API at this time.

## Prerequisites
- Repository access to `Chaiya88/doglc-digital-wallet`
- Admin permissions to create organization projects
- Access to the referenced issue: https://github.com/Chaiya88/logic-digital-wallet/issues/4

## Step-by-Step Setup

### 1. Create the Project Board

1. **Navigate to GitHub Projects**
   - Go to: https://github.com/orgs/Chaiya88/projects (if organization)
   - Or: https://github.com/Chaiya88?tab=projects (if personal account)

2. **Create New Project**
   - Click "New project"
   - Select "Board" template
   - Name: `merge-doglc-into-logic-workspace`
   - Description: "Project board for merging doglc-digital-wallet and logic-digital-wallet repositories"

3. **Set Visibility**
   - Choose "Public" to make the project visible to everyone
   - Confirm creation

### 2. Configure Board Columns

Replace the default columns with our specific workflow:

1. **Delete default columns** (To do, In Progress, Done)

2. **Add new columns in order:**
   - **Backlog**
     - Description: "Items identified but not yet ready to work on"
   - **To do**
     - Description: "Items ready to be worked on, prioritized and scoped"
   - **In progress**
     - Description: "Items currently being worked on"
   - **Review**
     - Description: "Items completed and under review (PR/code review)"
   - **Done**
     - Description: "Completed items"

### 3. Set Up Automation Rules

Configure built-in automation for each column:

1. **Go to Settings → Manage automation**

2. **Add the following rules:**

   **For "Backlog" column:**
   - When: Issue opened → Move to: Backlog

   **For "To do" column:**
   - When: Issue assigned → Move to: To do
   - When: Issue reopened → Move to: To do

   **For "In progress" column:**
   - When: Pull request opened → Move to: In progress
   - When: Pull request reopened → Move to: In progress

   **For "Review" column:**
   - When: Pull request review requested → Move to: Review
   - When: Pull request approved → Move to: Review

   **For "Done" column:**
   - When: Issue closed → Move to: Done
   - When: Pull request merged → Move to: Done

### 4. Add Custom Fields (Optional)

1. **Go to Settings → Custom fields**

2. **Add these fields:**
   - **Priority** (Single select): High, Medium, Low
   - **Effort** (Number): 1-5 story points scale
   - **Category** (Single select): File Migration, Security, PR Strategy, System Integration, Documentation
   - **Due Date** (Date): Target completion date

### 5. Create Initial Cards

Add cards in this order, referring to `PROJECT_BOARD_TEMPLATE.json` for details:

#### In "To do" column:
1. **📝 Project Overview and Guidelines**
   - Type: Note
   - Content: "See PROJECT_BOARD_README.md for comprehensive project overview, guidelines, and workflow instructions."
   - Add labels: documentation, guidelines

2. **🎯 Master Checklist - Merge Repository Benefits**
   - Type: Link to issue
   - URL: https://github.com/Chaiya88/logic-digital-wallet/issues/4
   - Add labels: epic, planning

3. **🔍 Sensitive Data Audit**
   - Type: Note  
   - Content: "Scan and remove sensitive data from wrangler.toml files including bank accounts, API keys, emails, webhook URLs."
   - Priority: High, Effort: 4
   - Add labels: security, audit

4. **🔐 Secrets Migration to Cloudflare**
   - Type: Note
   - Content: "Move all secrets to wrangler secret/Cloudflare Vault. Update configurations to use environment variables."
   - Priority: High, Effort: 3
   - Add labels: security, secrets

5. **🕵️ Git History Security Check**
   - Type: Note
   - Content: "Audit git history for leaked secrets using git log searches and security scanning tools."
   - Priority: High, Effort: 2
   - Add labels: security, git-history

6. **🔄 Secret Rotation**
   - Type: Note
   - Content: "Rotate and change any previously leaked secrets. Generate new credentials for production use."
   - Priority: High, Effort: 2
   - Add labels: security, rotation

7. **📦 Dependency Resolution**
   - Type: Note
   - Content: "Resolve package.json conflicts for wrangler, telegraf, jose and other dependencies. Ensure version compatibility."
   - Priority: Medium, Effort: 2
   - Add labels: dependencies, resolution

8. **⚖️ License Decision**
   - Type: Note
   - Content: "Decide between MIT vs PRIVATE license for the merged repository. Consider intellectual property implications."
   - Priority: Low, Effort: 1
   - Add labels: legal, license

#### In "Backlog" column:
1. **🗂️ Source Code Migration**
   - Priority: High, Effort: 5
   - Category: File Migration

2. **⚙️ Production Configuration Integration**
   - Priority: High, Effort: 4
   - Category: File Migration

3. **📋 Wrangler Configuration Consolidation**
   - Priority: Medium, Effort: 3
   - Category: File Migration

4. **📚 Documentation and Scripts Integration**
   - Priority: Medium, Effort: 3
   - Category: Documentation

5. **🔧 Configuration Files Cleanup**
   - Priority: Low, Effort: 2
   - Category: File Migration

6. **PR#1: Core Structure**
   - Priority: High, Effort: 5
   - Category: PR Strategy

7. **PR#2: Production Config**
   - Priority: High, Effort: 4
   - Category: PR Strategy

8. **PR#3: Documentation**
   - Priority: Medium, Effort: 3
   - Category: PR Strategy

9. **PR#4: Cleanup**
   - Priority: Medium, Effort: 2
   - Category: PR Strategy

10. **PR#5: Security Hardening**
    - Priority: High, Effort: 4
    - Category: PR Strategy

11. **🏗️ CI/CD Pipeline Setup**
    - Priority: Medium, Effort: 4
    - Category: System Integration

12. **📖 README Update**
    - Priority: Medium, Effort: 3
    - Category: Documentation

13. **🚀 Production Deployment Guide**
    - Priority: Medium, Effort: 3
    - Category: Documentation

### 6. Enable GitHub Actions Automation

1. **Get the Project ID**
   - From the project URL (e.g., https://github.com/orgs/Chaiya88/projects/123)
   - The number at the end is your project ID

2. **Add Repository Secret**
   - Go to repository Settings → Secrets and variables → Actions
   - Add new secret: `PROJECT_BOARD_ID`
   - Value: The project ID from step 1

3. **Verify Workflow**
   - The `project-automation.yml` workflow should now be active
   - Test by creating a test issue and verifying it moves to Backlog

### 7. Configure Project Settings

1. **Go to Project Settings**

2. **Set up notifications:**
   - Enable notifications for project updates
   - Configure team member notifications

3. **Configure archiving:**
   - Enable auto-archive for Done items after 30 days
   - Set up cleanup schedule

4. **Set permissions:**
   - Add team members with appropriate access levels
   - Configure admin permissions for security-related changes

### 8. Add Team Members

1. **Invite collaborators**
   - Add repository contributors to the project
   - Set appropriate permission levels

2. **Define roles:**
   - Project admin: Repository owner
   - Contributors: Development team members
   - Reviewers: Senior developers and security team

### 9. Final Verification

1. **Test automation:**
   - Create a test issue and verify it appears in Backlog
   - Assign the issue and verify it moves to To do
   - Open a PR and verify it moves to In progress

2. **Verify card links:**
   - Ensure the main issue link works correctly
   - Check that all cards have proper descriptions

3. **Review security:**
   - Confirm no sensitive information is visible in public project
   - Verify team access is properly configured

## Maintenance

### Regular Tasks
- **Weekly**: Review card progress and update statuses
- **Bi-weekly**: Prioritize backlog items  
- **Monthly**: Archive completed items and clean up board
- **Quarterly**: Review automation rules and project structure

### Monitoring
- Track automation rule effectiveness
- Monitor card movement patterns
- Review team engagement with the board
- Assess project completion metrics

## Troubleshooting

### Common Issues

**Automation not working:**
- Verify PROJECT_BOARD_ID secret is set correctly
- Check GitHub Actions workflow permissions
- Ensure project visibility allows automation

**Cards not linking to issues:**
- Verify issue URLs are correct and accessible
- Check repository permissions for cross-repo linking
- Ensure issue numbers are accurate

**Team access problems:**
- Review project visibility settings
- Check individual team member permissions
- Verify organization settings allow project access

## Support

For issues with this setup:
1. Check the GitHub Projects documentation
2. Review repository issues for similar problems  
3. Contact the repository maintainer
4. Reference the security checklist for sensitive operations

---

**Setup Version**: 1.0  
**Last Updated**: September 2025  
**Estimated Setup Time**: 45-60 minutes