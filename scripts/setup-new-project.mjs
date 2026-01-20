#!/usr/bin/env node

/**
 * Setup Script for NestJS Backend Starter Template
 *
 * This script automates the setup of a new project from this starter template.
 * It will:
 * - Prompt for project details
 * - Update package.json, README, and other config files
 * - Set up environment files
 * - Clean up template-specific files
 * - Initialize git repository
 * - Install dependencies
 * - Generate Prisma client
 */

import { readFile, writeFile, unlink, rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisified question function
function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(
    `\n${colors.cyan}[${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`,
  );
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Validate project name (npm package name rules)
function isValidProjectName(name) {
  return /^[a-z0-9-_]+$/.test(name);
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function promptForDetails() {
  log(
    '\n╔═══════════════════════════════════════════════════════════╗',
    'cyan',
  );
  log('║  NestJS Backend Starter Template - Project Setup Wizard  ║', 'cyan');
  log(
    '╚═══════════════════════════════════════════════════════════╝\n',
    'cyan',
  );

  const details = {};

  // Project name
  while (true) {
    const projectName = await question(
      `${colors.blue}Project name${colors.reset} (lowercase, hyphens only): `,
    );
    if (!projectName) {
      logError('Project name is required!');
      continue;
    }
    if (!isValidProjectName(projectName)) {
      logError(
        'Invalid project name! Use lowercase letters, numbers, and hyphens only.',
      );
      continue;
    }
    details.projectName = projectName;
    break;
  }

  // Project description
  details.description =
    (await question(`${colors.blue}Project description${colors.reset}: `)) ||
    '';

  // Author name
  details.authorName =
    (await question(`${colors.blue}Author name${colors.reset}: `)) || '';

  // Author email
  while (true) {
    const email = await question(`${colors.blue}Author email${colors.reset}: `);
    if (email && !isValidEmail(email)) {
      logError('Invalid email format!');
      continue;
    }
    details.authorEmail = email || '';
    break;
  }

  // Repository URL
  details.repositoryUrl =
    (await question(
      `${colors.blue}Git repository URL${colors.reset} (optional): `,
    )) || '';

  // Database name
  details.databaseName =
    (await question(
      `${colors.blue}Database name${colors.reset} [${details.projectName}-db]: `,
    )) || `${details.projectName}-db`;

  // Keep example code
  const keepExamples = await question(
    `${colors.blue}Keep example modules?${colors.reset} (y/N): `,
  );
  details.keepExamples = keepExamples.toLowerCase() === 'y';

  // Clean logs
  const cleanLogs = await question(
    `${colors.blue}Clean existing log files?${colors.reset} (Y/n): `,
  );
  details.cleanLogs = cleanLogs.toLowerCase() !== 'n';

  // Initialize git
  const initGit = await question(
    `${colors.blue}Initialize fresh git repository?${colors.reset} (Y/n): `,
  );
  details.initGit = initGit.toLowerCase() !== 'n';

  // Install dependencies
  const installDeps = await question(
    `${colors.blue}Install dependencies after setup?${colors.reset} (Y/n): `,
  );
  details.installDeps = installDeps.toLowerCase() !== 'n';

  return details;
}

async function updatePackageJson(details) {
  logStep('1/8', 'Updating package.json...');

  const packagePath = join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));

  packageJson.name = details.projectName;
  packageJson.description = details.description;
  packageJson.version = '1.0.0';

  if (details.authorName || details.authorEmail) {
    packageJson.author = details.authorEmail
      ? `${details.authorName} <${details.authorEmail}>`
      : details.authorName;
  }

  if (details.repositoryUrl) {
    packageJson.repository = {
      type: 'git',
      url: details.repositoryUrl,
    };
  }

  // Remove postinstall script for production use
  if (packageJson.scripts.postinstall) {
    delete packageJson.scripts.postinstall;
  }

  await writeFile(
    packagePath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8',
  );
  logSuccess('package.json updated');
}

async function updateReadme(details) {
  logStep('2/8', 'Creating fresh README.md...');

  const readmePath = join(ROOT_DIR, 'README.md');

  // Create a fresh README without template language
  const freshReadme = `# ${details.projectName}

${details.description ? details.description + '\n\n' : ''}## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: MongoDB with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (Access & Refresh tokens)
- **API Documentation**: Swagger/OpenAPI
- **Task Scheduling**: Bull Queue with Redis
- **Storage**: Cloudinary for media management
- **Validation**: Zod schema validation
- **Rate Limiting**: Throttler for API protection
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+
- pnpm
- MongoDB instance
- Redis instance
- Cloudinary account (optional, for media management)

## Installation

### 1. Clone and Install Dependencies

\`\`\`bash
${details.repositoryUrl ? `# Clone the repository\ngit clone ${details.repositoryUrl}\ncd ${details.projectName}\n\n` : ''}# Install dependencies
pnpm install
\`\`\`

### 2. Environment Setup

Create a \`.env\` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Update \`.env\` with your actual credentials. Generate secure JWT secrets:

\`\`\`bash
# Generate secure random strings for JWT secrets
openssl rand -base64 32
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma Client
pnpm run prisma:generate

# Set up database and seed
pnpm run prisma:db:reset
\`\`\`

## Running the Application

### Development

\`\`\`bash
# Start in watch mode
pnpm run start:dev

# Start with debugging
pnpm run start:debug
\`\`\`

### Production

\`\`\`bash
# Build
pnpm run build

# Run built application
pnpm run start:prod

# Using PM2
pnpm run prod
\`\`\`

## API Documentation

Once the application is running, visit:

- **Swagger UI**: http://localhost:3000/api/docs

## Project Structure

\`\`\`
src/
├── config/              # Configuration management
├── constants/           # Global constants and error messages
├── filters/             # Exception filters
├── guards/              # Route guards
├── helpers/             # Utility helpers
├── interceptors/        # Response interceptors
├── lib/                 # External service integrations
├── middlewares/         # NestJS middlewares
├── modules/             # Feature modules
├── pipes/               # Validation pipes
├── shared/              # Shared utilities
└── utils/               # Utility functions
\`\`\`

## Available Scripts

\`\`\`bash
# Development
pnpm run start:dev              # Start dev server
pnpm run start:debug            # Start with debugger

# Database
pnpm run prisma:studio          # Open Prisma Studio
pnpm run prisma:generate        # Generate Prisma client
pnpm run prisma:db:reset        # Reset database

# Code Quality
pnpm run lint                   # Lint code
pnpm run format                 # Format code
pnpm run test                   # Run tests
pnpm run test:cov               # Test with coverage

# Production
pnpm run build                  # Build for production
pnpm run start:prod             # Run production build
\`\`\`

## Environment Variables

Key environment variables to configure:

| Variable | Description | Example |
|----------|-------------|----------|
| \`NODE_ENV\` | Environment | \`development\` |
| \`PORT\` | Server port | \`3000\` |
| \`DATABASE_URL\` | MongoDB connection | \`mongodb://localhost:27017/${details.databaseName}\` |
| \`JWT_SECRET\` | Access token secret | Generated string |
| \`JWT_REFRESH_SECRET\` | Refresh token secret | Generated string |
| \`REDIS_HOST\` | Redis host | \`localhost\` |
| \`REDIS_PORT\` | Redis port | \`6379\` |

See \`.env.example\` for all available variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ${details.repositoryUrl ? 'MIT' : 'UNLICENSED'} License.
`;

  await writeFile(readmePath, freshReadme, 'utf-8');
  logSuccess('README.md created');
}

async function createEnvFile(details) {
  logStep('3/8', 'Creating .env file...');

  const envExamplePath = join(ROOT_DIR, '.env.example');
  const envPath = join(ROOT_DIR, '.env');

  if (existsSync(envPath)) {
    logWarning('.env file already exists, skipping creation');
    return;
  }

  let envContent = await readFile(envExamplePath, 'utf-8');

  // Set some defaults
  envContent = envContent.replace(/^NODE_ENV=$/m, 'NODE_ENV=development');
  envContent = envContent.replace(/^PORT=$/m, 'PORT=3000');

  // Update database URL with project-specific database name
  const dbUrl = `mongodb://localhost:27017/${details.databaseName}`;
  envContent = envContent.replace(/^DATABASE_URL=$/m, `DATABASE_URL=${dbUrl}`);

  envContent = envContent.replace(/^REDIS_HOST=$/m, 'REDIS_HOST=localhost');
  envContent = envContent.replace(/^REDIS_PORT=$/m, 'REDIS_PORT=6379');
  envContent = envContent.replace(
    /^FRONTEND_URL=$/m,
    'FRONTEND_URL=http://localhost:3001',
  );
  envContent = envContent.replace(
    /^BACKEND_URL=$/m,
    'BACKEND_URL=http://localhost:3000',
  );

  await writeFile(envPath, envContent, 'utf-8');
  logSuccess('.env file created');
  logWarning('⚠ Remember to update .env with your actual credentials!');
}

async function cleanLogFiles(details) {
  if (!details.cleanLogs) {
    logStep('4/8', 'Skipping log cleanup...');
    return;
  }

  logStep('4/8', 'Cleaning log files...');

  const logsDir = join(ROOT_DIR, 'logs');

  if (existsSync(logsDir)) {
    try {
      await rm(logsDir, { recursive: true, force: true });
      await mkdir(logsDir);

      // Create .gitkeep
      await writeFile(join(logsDir, '.gitkeep'), '', 'utf-8');

      logSuccess('Log files cleaned');
    } catch (error) {
      logWarning(`Could not clean logs: ${error.message}`);
    }
  }
}

async function removeExampleCode(details) {
  if (details.keepExamples) {
    logStep('5/8', 'Keeping example modules...');
    return;
  }

  logStep('5/8', 'Removing example modules...');

  // List of example directories/files to remove
  // Adjust these paths based on your actual example modules
  const examplePaths = [
    // Add paths to example modules here if you have them
    // e.g., 'src/modules/example',
  ];

  for (const path of examplePaths) {
    const fullPath = join(ROOT_DIR, path);
    if (existsSync(fullPath)) {
      try {
        await rm(fullPath, { recursive: true, force: true });
        logSuccess(`Removed ${path}`);
      } catch (error) {
        logWarning(`Could not remove ${path}: ${error.message}`);
      }
    }
  }

  if (examplePaths.length === 0) {
    log('No example modules to remove', 'dim');
  }
}

async function initializeGit(details) {
  if (!details.initGit) {
    logStep('6/8', 'Skipping git initialization...');
    return;
  }

  logStep('6/8', 'Initializing fresh git repository...');

  const gitDir = join(ROOT_DIR, '.git');

  try {
    // Remove existing .git directory
    if (existsSync(gitDir)) {
      await rm(gitDir, { recursive: true, force: true });
      logSuccess('Removed existing .git directory');
    }

    // Initialize new git repository
    await execAsync('git init', { cwd: ROOT_DIR });
    logSuccess('Initialized new git repository');

    // Create initial commit
    await execAsync('git add .', { cwd: ROOT_DIR });
    await execAsync(
      'git commit -m "chore: initial commit from starter template"',
      { cwd: ROOT_DIR },
    );
    logSuccess('Created initial commit');

    if (details.repositoryUrl) {
      await execAsync(`git remote add origin ${details.repositoryUrl}`, {
        cwd: ROOT_DIR,
      });
      logSuccess('Added remote origin');
    }
  } catch (error) {
    logWarning(`Git initialization failed: ${error.message}`);
  }
}

async function installDependencies(details) {
  if (!details.installDeps) {
    logStep('7/8', 'Skipping dependency installation...');
    log('\n⚠ Remember to run: pnpm install', 'yellow');
    return;
  }

  logStep('7/8', 'Installing dependencies...');
  log('This may take a few minutes...', 'dim');

  try {
    await execAsync('pnpm install', { cwd: ROOT_DIR });
    logSuccess('Dependencies installed');
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    logWarning('You may need to run "pnpm install" manually');
  }
}

async function generatePrismaClient(details) {
  if (!details.installDeps) {
    logStep('8/8', 'Skipping Prisma generation...');
    log('\n⚠ Remember to run: pnpm run prisma:generate', 'yellow');
    return;
  }

  logStep('8/8', 'Generating Prisma client...');

  try {
    await execAsync('pnpm run prisma:generate', { cwd: ROOT_DIR });
    logSuccess('Prisma client generated');
  } catch (error) {
    logWarning(`Prisma generation failed: ${error.message}`);
    logWarning('You may need to run "pnpm run prisma:generate" manually');
  }
}

async function printNextSteps(details) {
  log(
    '\n╔═══════════════════════════════════════════════════════════╗',
    'green',
  );
  log('║               Setup Complete! 🚀                          ║', 'green');
  log(
    '╚═══════════════════════════════════════════════════════════╝\n',
    'green',
  );

  log('Next steps:', 'bright');
  log('');

  if (!details.installDeps) {
    log('  1. Install dependencies:', 'cyan');
    log('     pnpm install', 'dim');
    log('');
  }

  log(
    `  ${details.installDeps ? '1' : '2'}. Update your .env file with actual credentials`,
    'cyan',
  );
  log('     - Database connection string', 'dim');
  log('     - Redis connection', 'dim');
  log('     - JWT secrets', 'dim');
  log('     - Mail service credentials', 'dim');
  log('     - Cloudinary credentials (if using)', 'dim');
  log('');

  log(`  ${details.installDeps ? '2' : '3'}. Set up your database:`, 'cyan');
  log('     pnpm run prisma:db:reset', 'dim');
  log('');

  log(
    `  ${details.installDeps ? '3' : '4'}. Start the development server:`,
    'cyan',
  );
  log('     pnpm run start:dev', 'dim');
  log('');

  log(
    `  ${details.installDeps ? '4' : '5'}. Visit the API documentation:`,
    'cyan',
  );
  log('     http://localhost:3000/api/docs', 'dim');
  log('');

  log('Happy coding! 🎉\n', 'green');
}

async function confirmSetup() {
  log('\n⚠ This will modify files in the current directory.', 'yellow');
  const confirm = await question(
    `${colors.yellow}Continue with setup?${colors.reset} (Y/n): `,
  );

  if (confirm.toLowerCase() === 'n') {
    log('Setup cancelled.', 'yellow');
    return false;
  }

  return true;
}

async function main() {
  try {
    // Confirm setup
    const shouldContinue = await confirmSetup();
    if (!shouldContinue) {
      process.exit(0);
    }

    // Gather project details
    const details = await promptForDetails();

    log('\n' + '═'.repeat(60), 'cyan');
    log('Starting setup...', 'bright');
    log('═'.repeat(60) + '\n', 'cyan');

    // Execute setup steps
    await updatePackageJson(details);
    await updateReadme(details);
    await createEnvFile(details);
    await cleanLogFiles(details);
    await removeExampleCode(details);
    await initializeGit(details);
    await installDependencies(details);
    await generatePrismaClient(details);

    // Print next steps
    await printNextSteps(details);

    // Clean up - remove all setup scripts
    log('Cleaning up setup scripts...', 'dim');
    const scriptsToRemove = [
      join(ROOT_DIR, 'scripts', 'setup-new-project.mjs'),
      join(ROOT_DIR, 'scripts', 'setup-new-project.sh'),
      join(ROOT_DIR, 'scripts', 'setup-new-project.ps1'),
    ];

    for (const scriptPath of scriptsToRemove) {
      try {
        if (existsSync(scriptPath)) {
          await unlink(scriptPath);
        }
      } catch (error) {
        // Silently continue if file doesn't exist or can't be deleted
      }
    }
    logSuccess('Setup scripts removed');
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
main();
