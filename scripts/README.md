# Setup Scripts

This directory contains scripts to help you quickly set up a new project from this starter template.

## Available Scripts

### 1. `setup-new-project.mjs` (Recommended)

**Node.js-based interactive setup script**

The most feature-rich and cross-platform option.

**Requirements:**

- Node.js 18+

**Usage:**

```bash
node scripts/setup-new-project.mjs
```

**Features:**

- Interactive prompts for project configuration
- Validates inputs (project name, email, etc.)
- Updates package.json, README.md, and other config files
- Creates .env file with sensible defaults
- Cleans log files
- Removes example modules (optional)
- Initializes fresh git repository
- Installs dependencies
- Generates Prisma client
- Self-deletes after completion
- Colored terminal output

---

### 2. `setup-new-project.sh`

**Bash script for Linux/macOS**

A shell script version for Unix-based systems.

**Requirements:**

- Bash 4+
- git
- pnpm
- (Optional) jq for automatic package.json updates

**Usage:**

```bash
chmod +x scripts/setup-new-project.sh
./scripts/setup-new-project.sh
```

**Features:**

- Interactive prompts
- Updates package.json (requires jq)
- Updates README.md
- Creates .env file
- Cleans logs
- Initializes git
- Installs dependencies
- Self-deletes after completion

---

### 3. `setup-new-project.ps1`

**PowerShell script for Windows**

A PowerShell script optimized for Windows systems.

**Requirements:**

- PowerShell 5.1+ or PowerShell Core 7+
- git
- pnpm

**Usage:**

```powershell
# Allow script execution (run as Administrator, one time only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the script
.\scripts\setup-new-project.ps1
```

**Features:**

- Interactive prompts
- Updates package.json
- Updates README.md
- Creates .env file
- Cleans logs
- Initializes git
- Installs dependencies
- Self-deletes after completion

---

## What the Setup Scripts Do

All scripts perform the following tasks:

### 1. Gather Project Information

- Project name (kebab-case)
- Project description
- Author name and email
- Git repository URL
- Database name
- Various setup preferences

### 2. Update Configuration Files

- **package.json**: Updates name, description, version, author, and repository
- **README.md**: Updates project title and description
- **Removes postinstall script** to prevent auto-seeding in production

### 3. Environment Setup

- Creates `.env` file from `.env.example`
- Sets sensible defaults:
  - `NODE_ENV=development`
  - `PORT=3000`
  - `DATABASE_URL=mongodb://localhost:27017/{your-db-name}`
  - `REDIS_HOST=localhost`
  - `REDIS_PORT=6379`
  - Frontend and backend URLs

### 4. Clean Up Template Files

- Clears log directory
- Removes example modules (optional)
- Removes .git history (optional)

### 5. Initialize Git Repository

- Removes existing git history
- Initializes fresh repository
- Creates initial commit
- Adds remote origin (if provided)

### 6. Install Dependencies

- Runs `pnpm install`
- Generates Prisma client
- Seeds database (via postinstall hook)

### 7. Self-Cleanup

- The script removes itself after successful execution

---

## Quick Start Guide

### When Cloning This Template

1. **Clone the repository:**

   ```bash
   git clone <template-repo-url> my-new-project
   cd my-new-project
   ```

2. **Run the setup script:**

   **Node.js (Recommended for all platforms):**

   ```bash
   node scripts/setup-new-project.mjs
   ```

   **Bash (Linux/macOS):**

   ```bash
   chmod +x scripts/setup-new-project.sh
   ./scripts/setup-new-project.sh
   ```

   **PowerShell (Windows):**

   ```powershell
   .\scripts\setup-new-project.ps1
   ```

3. **Follow the interactive prompts** to configure your project

4. **Update your .env file** with actual credentials:
   - Database connection
   - Redis connection
   - JWT secrets (generate secure random strings)
   - Mail service credentials
   - Cloudinary credentials (if using)
   - Other API keys

5. **Set up your database:**

   ```bash
   pnpm run prisma:db:reset
   ```

6. **Start developing:**

   ```bash
   pnpm run start:dev
   ```

7. **Visit your API documentation:**
   - http://localhost:3000/api/docs

---

## Manual Setup (Alternative)

If you prefer not to use the automated scripts, you can set up manually:

1. Update `package.json` with your project details
2. Update `README.md` with your project information
3. Copy `.env.example` to `.env` and fill in values
4. Clean the `logs/` directory
5. Remove `.git` and run `git init` to start fresh
6. Run `pnpm install`
7. Run `pnpm run prisma:generate`
8. Run `pnpm run prisma:db:reset` to set up the database
9. Delete the setup scripts from `scripts/`

---

## Security Reminders

After running the setup script, make sure to:

- [ ] Generate strong, unique JWT secrets (use `openssl rand -base64 32`)
- [ ] Update all placeholder credentials in `.env`
- [ ] Never commit your `.env` file to version control
- [ ] Review and update CORS settings in `main.ts`
- [ ] Set up proper rate limiting for production
- [ ] Configure your production database with authentication
- [ ] Enable Redis authentication in production
- [ ] Review and update security headers

---

## Troubleshooting

### "Command not found" errors

Make sure you have the required dependencies installed:

- Node.js 18+
- pnpm: `npm install -g pnpm`
- git

### Permission denied (Linux/macOS)

Make the script executable:

```bash
chmod +x scripts/setup-new-project.sh
```

### PowerShell execution policy error (Windows)

Run as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### jq not found (Bash script)

Install jq for automatic JSON updates:

- **macOS:** `brew install jq`
- **Ubuntu/Debian:** `sudo apt-get install jq`
- **CentOS/RHEL:** `sudo yum install jq`

Or manually update package.json after running the script.

### Git errors

Make sure git is installed and configured:

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Contributing

If you find issues or have suggestions for improving the setup scripts, please open an issue or submit a pull request.

---

## License

These scripts are part of the NestJS Backend Starter Template and are provided as-is for project initialization purposes.
