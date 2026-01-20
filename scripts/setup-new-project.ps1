# Setup Script for NestJS Backend Starter Template (PowerShell version)
# This is a Windows-friendly version of the setup script

param(
    [switch]$SkipPrompts = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Helper functions
function Write-Step {
    param($Step, $Message)
    Write-Host "`n[$Step] " -ForegroundColor Cyan -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param($Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error {
    param($Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Test-ProjectName {
    param($Name)
    return $Name -match '^[a-z0-9-]+$'
}

function Test-Email {
    param($Email)
    return $Email -match '^[^\s@]+@[^\s@]+\.[^\s@]+$'
}

# Banner
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  NestJS Backend Starter Template - Project Setup Wizard  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Confirm setup
Write-Host "⚠ This will modify files in the current directory." -ForegroundColor Yellow
$confirm = Read-Host "Continue with setup? (Y/n)"
if ($confirm -eq 'n' -or $confirm -eq 'N') {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

# Gather project details
do {
    $ProjectName = Read-Host "Project name (lowercase, hyphens only)"
    if (-not (Test-ProjectName $ProjectName)) {
        Write-Error "Invalid project name! Use lowercase letters, numbers, and hyphens only."
    }
} while (-not (Test-ProjectName $ProjectName))

$Description = Read-Host "Project description"
$AuthorName = Read-Host "Author name"

do {
    $AuthorEmail = Read-Host "Author email"
    if ($AuthorEmail -and -not (Test-Email $AuthorEmail)) {
        Write-Error "Invalid email format!"
    }
} while ($AuthorEmail -and -not (Test-Email $AuthorEmail))

$RepoUrl = Read-Host "Git repository URL (optional)"
$DbName = Read-Host "Database name [$ProjectName-db]"
if (-not $DbName) { $DbName = "$ProjectName-db" }

$CleanLogs = Read-Host "Clean existing log files? (Y/n)"
if (-not $CleanLogs) { $CleanLogs = 'Y' }

$InitGit = Read-Host "Initialize fresh git repository? (Y/n)"
if (-not $InitGit) { $InitGit = 'Y' }

$InstallDeps = Read-Host "Install dependencies after setup? (Y/n)"
if (-not $InstallDeps) { $InstallDeps = 'Y' }

Write-Host "`n$('=' * 60)" -ForegroundColor Cyan
Write-Host "Starting setup..." -ForegroundColor White
Write-Host "$('=' * 60)`n" -ForegroundColor Cyan

# Step 1: Update package.json
Write-Step "1/8" "Updating package.json..."
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $packageJson.name = $ProjectName
    $packageJson.description = $Description
    $packageJson.version = "1.0.0"
    
    if ($AuthorName -or $AuthorEmail) {
        $packageJson.author = if ($AuthorEmail) { "$AuthorName <$AuthorEmail>" } else { $AuthorName }
    }
    
    if ($RepoUrl) {
        $packageJson.repository = @{
            type = "git"
            url = $RepoUrl
        }
    }
    
    # Remove postinstall script
    $packageJson.scripts.PSObject.Properties.Remove('postinstall')
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Success "package.json updated"
} catch {
    Write-Warning "Could not update package.json: $_"
}

# Step 2: Create fresh README
Write-Step "2/8" "Creating fresh README.md..."
try {
    $descSection = if ($Description) { "$Description`n`n" } else { "" }
    $repoSection = if ($RepoUrl) { "git clone $RepoUrl`ncd $ProjectName`n`n" } else { "" }
    $license = if ($RepoUrl) { "MIT" } else { "UNLICENSED" }
    
    $readme = @"
# $ProjectName

$descSection## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: MongoDB with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (Access & Refresh tokens)
- **API Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm

## Installation

``````bash
$repoSectionpnpm install
cp .env.example .env
# Update .env with your credentials
pnpm run prisma:generate
pnpm run prisma:db:reset
``````

## Running

``````bash
pnpm run start:dev    # Development
pnpm run build        # Production build
pnpm run start:prod   # Run production
``````

## API Documentation

http://localhost:3000/api/docs

## License

$license
"@
    
    Set-Content "README.md" -Value $readme -NoNewline
    Write-Success "README.md created"
} catch {
    Write-Warning "Could not create README.md: $_"
}

# Step 3: Create .env file
Write-Step "3/8" "Creating .env file..."
if (-not (Test-Path ".env")) {
    try {
        $envContent = Get-Content ".env.example" -Raw
        $envContent = $envContent -replace '^NODE_ENV=.*', 'NODE_ENV=development'
        $envContent = $envContent -replace '^PORT=.*', 'PORT=3000'
        $envContent = $envContent -replace '^DATABASE_URL=.*', "DATABASE_URL=mongodb://localhost:27017/$DbName"
        $envContent = $envContent -replace '^REDIS_HOST=.*', 'REDIS_HOST=localhost'
        $envContent = $envContent -replace '^REDIS_PORT=.*', 'REDIS_PORT=6379'
        $envContent = $envContent -replace '^FRONTEND_URL=.*', 'FRONTEND_URL=http://localhost:3001'
        $envContent = $envContent -replace '^BACKEND_URL=.*', 'BACKEND_URL=http://localhost:3000'
        
        Set-Content ".env" -Value $envContent -NoNewline
        Write-Success ".env file created"
        Write-Warning "⚠ Remember to update .env with your actual credentials!"
    } catch {
        Write-Warning "Could not create .env file: $_"
    }
} else {
    Write-Warning ".env file already exists, skipping creation"
}

# Step 4: Clean log files
if ($CleanLogs -match '^[Yy]') {
    Write-Step "4/8" "Cleaning log files..."
    try {
        if (Test-Path "logs") {
            Remove-Item "logs\*" -Recurse -Force
            New-Item -Path "logs\.gitkeep" -ItemType File -Force | Out-Null
            Write-Success "Log files cleaned"
        }
    } catch {
        Write-Warning "Could not clean logs: $_"
    }
} else {
    Write-Step "4/8" "Skipping log cleanup..."
}

# Step 5: Remove example code (placeholder)
Write-Step "5/8" "Checking for example modules..."
Write-Host "No example modules to remove"

# Step 6: Initialize Git
if ($InitGit -match '^[Yy]') {
    Write-Step "6/8" "Initializing fresh git repository..."
    try {
        if (Test-Path ".git") {
            Remove-Item ".git" -Recurse -Force
            Write-Success "Removed existing .git directory"
        }
        
        git init
        Write-Success "Initialized new git repository"
        
        git add .
        git commit -m "chore: initial commit from starter template"
        Write-Success "Created initial commit"
        
        if ($RepoUrl) {
            git remote add origin $RepoUrl
            Write-Success "Added remote origin"
        }
    } catch {
        Write-Warning "Git initialization failed: $_"
    }
} else {
    Write-Step "6/8" "Skipping git initialization..."
}

# Step 7: Install dependencies
if ($InstallDeps -match '^[Yy]') {
    Write-Step "7/8" "Installing dependencies..."
    Write-Host "This may take a few minutes..."
    try {
        pnpm install
        Write-Success "Dependencies installed"
    } catch {
        Write-Error "Failed to install dependencies: $_"
        Write-Warning "You may need to run 'pnpm install' manually"
    }
} else {
    Write-Step "7/8" "Skipping dependency installation..."
    Write-Warning "Remember to run: pnpm install"
}

# Step 8: Generate Prisma client
if ($InstallDeps -match '^[Yy]') {
    Write-Step "8/8" "Generating Prisma client..."
    try {
        pnpm run prisma:generate
        Write-Success "Prisma client generated"
    } catch {
        Write-Warning "Prisma generation failed: $_"
        Write-Warning "You may need to run 'pnpm run prisma:generate' manually"
    }
} else {
    Write-Step "8/8" "Skipping Prisma generation..."
    Write-Warning "Remember to run: pnpm run prisma:generate"
}

# Print next steps
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║               Setup Complete! 🚀                          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Next steps:`n" -ForegroundColor White

$stepNum = 1
if ($InstallDeps -notmatch '^[Yy]') {
    Write-Host "  $stepNum. Install dependencies:" -ForegroundColor Cyan
    Write-Host "     pnpm install`n"
    $stepNum++
}

Write-Host "  $stepNum. Update your .env file with actual credentials" -ForegroundColor Cyan
$stepNum++

Write-Host "  $stepNum. Set up your database:" -ForegroundColor Cyan
Write-Host "     pnpm run prisma:db:reset`n"
$stepNum++

Write-Host "  $stepNum. Start the development server:" -ForegroundColor Cyan
Write-Host "     pnpm run start:dev`n"
$stepNum++

Write-Host "  $stepNum. Visit the API documentation:" -ForegroundColor Cyan
Write-Host "     http://localhost:3000/api/docs`n"

Write-Host "Happy coding! 🎉`n" -ForegroundColor Green

# Clean up - remove all setup scripts
Write-Host "Cleaning up setup scripts..."
try {
    $scriptsDir = Split-Path -Parent $PSCommandPath
    Remove-Item "$scriptsDir\setup-new-project.mjs" -Force -ErrorAction SilentlyContinue
    Remove-Item "$scriptsDir\setup-new-project.sh" -Force -ErrorAction SilentlyContinue
    Remove-Item "$scriptsDir\setup-new-project.ps1" -Force -ErrorAction SilentlyContinue
    Write-Success "Setup scripts removed"
} catch {
    Write-Warning "Could not remove all setup scripts, you may delete them manually"
}
