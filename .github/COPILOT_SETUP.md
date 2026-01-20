# GitHub Copilot Custom Instructions Setup

## Overview

This project now has comprehensive GitHub Copilot custom instructions installed to guide AI-powered code generation according to enterprise backend best practices.

## Installed Instructions

### Root Configuration

- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Main project-level instructions tailored for this enterprise NestJS backend application

### Specialized Instructions (`.github/instructions/`)

1. **[nestjs.instructions.md](instructions/nestjs.instructions.md)**
   - NestJS development standards and best practices
   - Dependency injection patterns
   - Modular architecture guidelines
   - Controllers, services, DTOs, guards, interceptors
   - Testing strategies for NestJS applications

2. **[security-and-owasp.instructions.md](instructions/security-and-owasp.instructions.md)**
   - Comprehensive secure coding guidelines
   - OWASP Top 10 protection strategies
   - Input validation and sanitization
   - Authentication and authorization best practices
   - Secret management and cryptographic guidelines

3. **[performance-optimization.instructions.md](instructions/performance-optimization.instructions.md)**
   - Frontend and backend performance optimization
   - Database query optimization
   - Caching strategies
   - Memory management
   - Profiling and benchmarking techniques

4. **[github-actions.instructions.md](instructions/github-actions.instructions.md)**
   - CI/CD pipeline best practices
   - Workflow structure and optimization
   - Security in CI/CD
   - Testing integration
   - Deployment strategies

5. **[docker.instructions.md](instructions/docker.instructions.md)**
   - Dockerfile best practices
   - Multi-stage builds
   - Container security
   - Image optimization
   - Runtime and orchestration guidelines

## How It Works

GitHub Copilot automatically loads and applies these instructions when:

- You're working in this workspace
- Generating new code
- Reviewing existing code
- Answering questions in Copilot Chat

The instructions are applied hierarchically:

1. Root `.github/copilot-instructions.md` applies to the entire project
2. Specialized instructions in `.github/instructions/` apply based on file type and context

## Tech Stack Alignment

These instructions are specifically selected for your project's stack:

- ✅ **NestJS** - Full framework coverage
- ✅ **TypeScript** - Type safety and modern patterns
- ✅ **Prisma + MongoDB** - Database best practices
- ✅ **Security** - Enterprise-grade security standards
- ✅ **Performance** - Optimization for scalable applications
- ✅ **DevOps** - CI/CD and containerization
- ✅ **Testing** - Comprehensive testing strategies

## Benefits

### For Code Generation

- **Consistent Patterns**: All generated code follows established patterns
- **Security-First**: Security considerations built into every suggestion
- **Performance-Aware**: Optimized code by default
- **Best Practices**: Industry-standard approaches

### For Code Review

- **Automated Checks**: Copilot helps catch issues early
- **Learning**: Understand why certain patterns are recommended
- **Consistency**: Maintain code quality across the team

### For Documentation

- **Context-Aware**: Documentation follows project standards
- **Comprehensive**: Includes security, performance, and maintenance notes

## Usage Tips

### In Copilot Chat

Ask questions like:

- "How should I implement authentication in this NestJS app?"
- "What's the secure way to handle file uploads?"
- "Help me optimize this database query"
- "Create a new user module following best practices"

### In Code Editor

- Copilot suggestions will automatically follow the instructions
- Comments with `TODO:` or `FIXME:` will get context-aware suggestions
- New files will be scaffolded according to project patterns

### In Code Reviews

- Ask Copilot to review your changes: "Review this code for security issues"
- Get explanations: "Why is this pattern recommended?"
- Suggest improvements: "How can I make this more performant?"

## Maintenance

### Updating Instructions

To update the instructions from the awesome-copilot repository:

```bash
cd .github/instructions
curl -s https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/nestjs.instructions.md -o nestjs.instructions.md
# Repeat for other files as needed
```

### Custom Instructions

You can create custom instruction files:

1. Create `*.instructions.md` files in `.github/instructions/`
2. Include YAML frontmatter:
   ```yaml
   ---
   description: 'Brief description'
   applyTo: '**/*.ts' # Glob pattern for target files
   ---
   ```
3. Write your guidelines in Markdown

### Verification

To verify Copilot is using your instructions:

1. Open Copilot Chat
2. Ask: "What are the key principles for this project?"
3. Copilot should reference your custom instructions

## Source

All specialized instructions are sourced from the official [awesome-copilot repository](https://github.com/github/awesome-copilot) maintained by GitHub.

## Version Information

- **Setup Date**: January 20, 2026
- **Instruction Source**: github/awesome-copilot (main branch)
- **Project Type**: Enterprise NestJS Backend

## Additional Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Custom Instructions Guide](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Awesome Copilot Repository](https://github.com/github/awesome-copilot)

---

**Note**: These instructions enhance but don't replace good engineering judgment. Always review and test AI-generated code before committing to production.
