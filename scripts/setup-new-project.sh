#!/bin/bash

# Setup Script for NestJS Backend Starter Template (Bash version)
# This is a simpler version of the Node.js setup script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions
log_step() {
    echo -e "\n${CYAN}[$1]${NC} ${BOLD}$2${NC}"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo -e "\n${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  NestJS Backend Starter Template - Project Setup Wizard  ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}\n"

# Confirm setup
echo -e "${YELLOW}⚠ This will modify files in the current directory.${NC}"
read -p "Continue with setup? (Y/n): " confirm
if [[ $confirm == [nN] ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Gather project details
read -p "$(echo -e ${BLUE}Project name${NC} '(lowercase, hyphens only): ')" PROJECT_NAME
while [[ ! $PROJECT_NAME =~ ^[a-z0-9-]+$ ]]; do
    log_error "Invalid project name! Use lowercase letters, numbers, and hyphens only."
    read -p "$(echo -e ${BLUE}Project name${NC} '(lowercase, hyphens only): ')" PROJECT_NAME
done

read -p "$(echo -e ${BLUE}Project description${NC}': ')" DESCRIPTION
read -p "$(echo -e ${BLUE}Author name${NC}': ')" AUTHOR_NAME
read -p "$(echo -e ${BLUE}Author email${NC}': ')" AUTHOR_EMAIL
read -p "$(echo -e ${BLUE}Git repository URL${NC} '(optional): ')" REPO_URL
read -p "$(echo -e ${BLUE}Database name${NC} "[$PROJECT_NAME-db]: ")" DB_NAME
DB_NAME=${DB_NAME:-$PROJECT_NAME-db}

read -p "$(echo -e ${BLUE}Clean existing log files?${NC} '(Y/n): ')" CLEAN_LOGS
CLEAN_LOGS=${CLEAN_LOGS:-Y}

read -p "$(echo -e ${BLUE}Initialize fresh git repository?${NC} '(Y/n): ')" INIT_GIT
INIT_GIT=${INIT_GIT:-Y}

read -p "$(echo -e ${BLUE}Install dependencies after setup?${NC} '(Y/n): ')" INSTALL_DEPS
INSTALL_DEPS=${INSTALL_DEPS:-Y}

echo -e "\n${CYAN}$(printf '=%.0s' {1..60})${NC}"
echo -e "${BOLD}Starting setup...${NC}"
echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}\n"

# Step 1: Update package.json
log_step "1/8" "Updating package.json..."
if command -v jq &> /dev/null; then
    # Use jq if available for better JSON manipulation
    jq --arg name "$PROJECT_NAME" \
       --arg desc "$DESCRIPTION" \
       --arg author "$AUTHOR_NAME <$AUTHOR_EMAIL>" \
       --arg repo "$REPO_URL" \
       '.name = $name | .description = $desc | .version = "1.0.0" | .author = $author | 
        (if $repo != "" then .repository = {type: "git", url: $repo} else . end) |
        del(.scripts.postinstall)' \
       package.json > package.json.tmp && mv package.json.tmp package.json
    log_success "package.json updated"
else
    log_warning "jq not found, skipping package.json update (install jq for automatic updates)"
fi

# Step 2: Create fresh README
log_step "2/8" "Creating fresh README.md..."
cat > README.md << EOF
# $PROJECT_NAME

${DESCRIPTION:+$DESCRIPTION

}## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: MongoDB with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (Access & Refresh tokens)
- **API Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm

## Installation

\`\`\`bash
${REPO_URL:+git clone $REPO_URL
cd $PROJECT_NAME

}pnpm install
cp .env.example .env
# Update .env with your credentials
pnpm run prisma:generate
pnpm run prisma:db:reset
\`\`\`

## Running

\`\`\`bash
pnpm run start:dev    # Development
pnpm run build        # Production build
pnpm run start:prod   # Run production
\`\`\`

## API Documentation

http://localhost:3000/api/docs

## License

${REPO_URL:+MIT}${REPO_URL:-UNLICENSED}
EOF
log_success "README.md created"

# Step 3: Create .env file
log_step "3/8" "Creating .env file..."
if [[ ! -f .env ]]; then
    cp .env.example .env
    sed -i.bak "s|^NODE_ENV=.*|NODE_ENV=development|" .env
    sed -i.bak "s|^PORT=.*|PORT=3000|" .env
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=mongodb://localhost:27017/$DB_NAME|" .env
    sed -i.bak "s|^REDIS_HOST=.*|REDIS_HOST=localhost|" .env
    sed -i.bak "s|^REDIS_PORT=.*|REDIS_PORT=6379|" .env
    sed -i.bak "s|^FRONTEND_URL=.*|FRONTEND_URL=http://localhost:3001|" .env
    sed -i.bak "s|^BACKEND_URL=.*|BACKEND_URL=http://localhost:3000|" .env
    rm -f .env.bak
    log_success ".env file created"
    log_warning "⚠ Remember to update .env with your actual credentials!"
else
    log_warning ".env file already exists, skipping creation"
fi

# Step 4: Clean log files
if [[ $CLEAN_LOGS =~ ^[Yy]$ ]]; then
    log_step "4/8" "Cleaning log files..."
    rm -rf logs/*
    touch logs/.gitkeep
    log_success "Log files cleaned"
else
    log_step "4/8" "Skipping log cleanup..."
fi

# Step 5: Remove example code (placeholder)
log_step "5/8" "Checking for example modules..."
echo "No example modules to remove"

# Step 6: Initialize Git
if [[ $INIT_GIT =~ ^[Yy]$ ]]; then
    log_step "6/8" "Initializing fresh git repository..."
    rm -rf .git
    git init
    log_success "Initialized new git repository"
    
    git add .
    git commit -m "chore: initial commit from starter template"
    log_success "Created initial commit"
    
    if [[ -n "$REPO_URL" ]]; then
        git remote add origin "$REPO_URL"
        log_success "Added remote origin"
    fi
else
    log_step "6/8" "Skipping git initialization..."
fi

# Step 7: Install dependencies
if [[ $INSTALL_DEPS =~ ^[Yy]$ ]]; then
    log_step "7/8" "Installing dependencies..."
    echo "This may take a few minutes..."
    pnpm install
    log_success "Dependencies installed"
else
    log_step "7/8" "Skipping dependency installation..."
    log_warning "Remember to run: pnpm install"
fi

# Step 8: Generate Prisma client
if [[ $INSTALL_DEPS =~ ^[Yy]$ ]]; then
    log_step "8/8" "Generating Prisma client..."
    pnpm run prisma:generate
    log_success "Prisma client generated"
else
    log_step "8/8" "Skipping Prisma generation..."
    log_warning "Remember to run: pnpm run prisma:generate"
fi

# Print next steps
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║               Setup Complete! 🚀                          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BOLD}Next steps:${NC}\n"

if [[ ! $INSTALL_DEPS =~ ^[Yy]$ ]]; then
    echo -e "  ${CYAN}1. Install dependencies:${NC}"
    echo -e "     pnpm install\n"
    STEP_NUM=2
else
    STEP_NUM=1
fi

echo -e "  ${CYAN}$STEP_NUM. Update your .env file with actual credentials${NC}"
((STEP_NUM++))

echo -e "  ${CYAN}$STEP_NUM. Set up your database:${NC}"
echo -e "     pnpm run prisma:db:reset\n"
((STEP_NUM++))

echo -e "  ${CYAN}$STEP_NUM. Start the development server:${NC}"
echo -e "     pnpm run start:dev\n"
((STEP_NUM++))

echo -e "  ${CYAN}$STEP_NUM. Visit the API documentation:${NC}"
echo -e "     http://localhost:3000/api/docs\n"

echo -e "${GREEN}Happy coding! 🎉${NC}\n"

# Clean up - remove all setup scripts
echo "Cleaning up setup scripts..."
rm -f "$(dirname "$0")/setup-new-project.mjs"
rm -f "$(dirname "$0")/setup-new-project.sh"
rm -f "$(dirname "$0")/setup-new-project.ps1"
log_success "Setup scripts removed"
