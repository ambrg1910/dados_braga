# Contributing to Card Operations Insights & Validation System

Thank you for your interest in contributing to the Card Operations Insights & Validation System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Issue Reporting](#issue-reporting)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous to others, and avoid any form of harassment or discrimination.

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- PostgreSQL (v12.x or higher)
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/card-operations-system.git
   cd card-operations-system
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/original-owner/card-operations-system.git
   ```
4. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
5. Set up environment variables:
   - Copy `.env.example` to `.env` in both the backend and frontend directories
   - Update the values as needed for your local environment
6. Set up the database:
   ```bash
   cd ../backend
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
7. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # In a separate terminal, start frontend server
   cd frontend
   npm start
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. Make your changes, following the coding standards
3. Write or update tests as necessary
4. Run tests to ensure they pass
5. Update documentation if needed
6. Commit your changes following the commit guidelines
7. Push your branch to your fork
8. Submit a pull request

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the principle of DRY (Don't Repeat Yourself)
- Keep functions small and focused on a single task
- Use meaningful variable and function names
- Add comments for complex logic, but prefer self-documenting code

### Backend (Node.js/Express)

- Follow the ESLint configuration provided in the project
- Use async/await for asynchronous operations
- Organize code by feature/module
- Use proper error handling with try/catch blocks
- Validate all input data
- Use environment variables for configuration

### Frontend (React)

- Follow the ESLint and Prettier configurations provided in the project
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow the container/presentational component pattern
- Use CSS-in-JS (styled-components) for styling
- Ensure responsive design

### Database

- Use migrations for all database changes
- Add appropriate indexes for performance
- Use meaningful table and column names
- Follow naming conventions (snake_case for tables and columns)
- Include proper constraints and foreign keys

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(auth): add password reset functionality
fix(upload): resolve file size validation issue
docs: update API documentation
```

## Pull Request Process

1. Ensure your code follows the coding standards
2. Update the documentation with details of changes if applicable
3. Include relevant tests for your changes
4. The PR should work for all supported environments
5. Link any relevant issues in the PR description
6. Request a review from at least one maintainer
7. Address any feedback from reviewers

## Testing

### Backend Testing

- Write unit tests for all new functionality
- Use Jest as the testing framework
- Aim for high test coverage, especially for critical paths
- Mock external dependencies

```bash
cd backend
npm test
```

### Frontend Testing

- Write unit tests for components and hooks
- Use React Testing Library for component tests
- Write integration tests for critical user flows

```bash
cd frontend
npm test
```

## Documentation

- Update the README.md file with any necessary changes
- Document all new features, APIs, and configuration options
- Keep API documentation up-to-date
- Add JSDoc comments to functions and classes
- Update user guides when adding or changing user-facing features

## Issue Reporting

When reporting issues, please include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Environment information (OS, browser, Node.js version, etc.)
7. Any additional context

---

Thank you for contributing to the Card Operations Insights & Validation System! Your efforts help make this project better for everyone.