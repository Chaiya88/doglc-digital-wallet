#!/usr/bin/env node

/**
 * Project Board Setup Validation Script
 * Verifies all project board files are created and properly configured
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_FILES = [
  '.github/PROJECT_BOARD_CONFIG.md',
  '.github/PROJECT_BOARD_README.md', 
  '.github/SETUP_INSTRUCTIONS.md',
  '.github/SECURITY_CHECKLIST.md',
  '.github/PROJECT_BOARD_TEMPLATE.json',
  '.github/workflows/project-automation.yml'
];

const VALIDATION_CHECKS = [
  {
    name: 'File Existence',
    check: () => {
      const missing = PROJECT_FILES.filter(file => !existsSync(file));
      return {
        pass: missing.length === 0,
        message: missing.length === 0 
          ? '✅ All project files created successfully'
          : `❌ Missing files: ${missing.join(', ')}`
      };
    }
  },
  {
    name: 'Project Configuration',
    check: () => {
      try {
        const config = readFileSync('.github/PROJECT_BOARD_CONFIG.md', 'utf8');
        const hasName = config.includes('merge-doglc-into-logic-workspace');
        const hasColumns = config.includes('Backlog') && config.includes('To do') && config.includes('Done');
        const hasIssueRef = config.includes('logic-digital-wallet/issues/4');
        
        return {
          pass: hasName && hasColumns && hasIssueRef,
          message: hasName && hasColumns && hasIssueRef
            ? '✅ Project configuration is complete'
            : '❌ Project configuration is missing required elements'
        };
      } catch (error) {
        return {
          pass: false,
          message: `❌ Error reading project config: ${error.message}`
        };
      }
    }
  },
  {
    name: 'JSON Template Validation',
    check: () => {
      try {
        const template = readFileSync('.github/PROJECT_BOARD_TEMPLATE.json', 'utf8');
        const json = JSON.parse(template);
        const hasColumns = json.columns && json.columns.length === 5;
        const hasCards = json.initial_cards && json.initial_cards.length > 15;
        const hasAutomation = json.automations && json.automations.length > 0;
        
        return {
          pass: hasColumns && hasCards && hasAutomation,
          message: hasColumns && hasCards && hasAutomation
            ? '✅ JSON template is valid and complete'
            : '❌ JSON template is missing required structure'
        };
      } catch (error) {
        return {
          pass: false,
          message: `❌ JSON template validation failed: ${error.message}`
        };
      }
    }
  },
  {
    name: 'Workflow Configuration', 
    check: () => {
      try {
        const workflow = readFileSync('.github/workflows/project-automation.yml', 'utf8');
        const hasGitHubScript = workflow.includes('actions/github-script@v7');
        const hasProjectId = workflow.includes('PROJECT_BOARD_ID');
        const hasTriggers = workflow.includes('issues:') && workflow.includes('pull_request:');
        
        return {
          pass: hasGitHubScript && hasProjectId && hasTriggers,
          message: hasGitHubScript && hasProjectId && hasTriggers
            ? '✅ GitHub Actions workflow is properly configured'
            : '❌ Workflow configuration is incomplete'
        };
      } catch (error) {
        return {
          pass: false,
          message: `❌ Workflow validation failed: ${error.message}`
        };
      }
    }
  },
  {
    name: 'Security Checklist',
    check: () => {
      try {
        const security = readFileSync('.github/SECURITY_CHECKLIST.md', 'utf8');
        const hasAudit = security.includes('Sensitive Data Audit');
        const hasSecrets = security.includes('Secrets Migration');
        const hasGitHistory = security.includes('Git History Security');
        const hasRotation = security.includes('Secret Rotation');
        
        return {
          pass: hasAudit && hasSecrets && hasGitHistory && hasRotation,
          message: hasAudit && hasSecrets && hasGitHistory && hasRotation
            ? '✅ Security checklist is comprehensive'
            : '❌ Security checklist is missing key components'
        };
      } catch (error) {
        return {
          pass: false,
          message: `❌ Security checklist validation failed: ${error.message}`
        };
      }
    }
  },
  {
    name: 'README Integration',
    check: () => {
      try {
        const readme = readFileSync('README.md', 'utf8');
        const hasProjectSection = readme.includes('Project Management');
        const hasProjectBoard = readme.includes('merge-doglc-into-logic-workspace');
        const hasLinks = readme.includes('PROJECT_BOARD_CONFIG.md');
        
        return {
          pass: hasProjectSection && hasProjectBoard && hasLinks,
          message: hasProjectSection && hasProjectBoard && hasLinks
            ? '✅ README.md updated with project board information'
            : '❌ README.md missing project board integration'
        };
      } catch (error) {
        return {
          pass: false,
          message: `❌ README validation failed: ${error.message}`
        };
      }
    }
  }
];

function runValidation() {
  console.log('🔍 Validating Project Board Setup...\n');
  
  let totalChecks = 0;
  let passedChecks = 0;
  
  for (const check of VALIDATION_CHECKS) {
    totalChecks++;
    const result = check.check();
    
    if (result.pass) {
      passedChecks++;
    }
    
    console.log(`${check.name}: ${result.message}`);
  }
  
  console.log(`\n📊 Validation Summary: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 Project board setup is complete and ready!');
    console.log('\n📋 Next Steps:');
    console.log('1. Follow the setup instructions in .github/SETUP_INSTRUCTIONS.md');
    console.log('2. Create the project board manually in GitHub');
    console.log('3. Add the PROJECT_BOARD_ID secret to repository settings');
    console.log('4. Start using the project board for development coordination');
  } else {
    console.log('\n⚠️  Some validation checks failed. Please review and fix issues before proceeding.');
    process.exit(1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation();
}

export default runValidation;