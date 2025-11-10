# Contributing to RocketSchema

Thank you for your interest in contributing to RocketSchema! This document outlines our branching strategy and version management workflow.

## Branch Strategy

RocketSchema follows a structured branching model to ensure code quality and stable releases:

### Main Branches

- **`main`** - Production-ready code
  - Contains only stable, released versions
  - Protected branch (requires pull request and reviews)
  - Tagged with semantic versions (v1.0.0, v1.1.0, etc.)
  - Automatically deployed to production/npm

- **`staging`** - Pre-production testing
  - Code ready for final validation before production
  - Used for integration testing and QA
  - Merged from `develop` when a release is ready
  - After validation, merged into `main`

- **`develop`** - Integration branch
  - Latest development changes
  - All feature branches merge here first
  - Continuous integration runs here
  - Should always be in a working state

### Supporting Branches

#### Feature Branches
- **Naming**: `feature/<description>` (e.g., `feature/add-invoice-schema`)
- **Branch from**: `develop`
- **Merge back into**: `develop`
- **Purpose**: Develop new features or schemas

```bash
git checkout develop
git checkout -b feature/add-invoice-schema
# Work on your feature
git push origin feature/add-invoice-schema
# Create PR to develop
```

#### Bugfix Branches
- **Naming**: `bugfix/<description>` (e.g., `bugfix/fix-person-validation`)
- **Branch from**: `develop`
- **Merge back into**: `develop`
- **Purpose**: Fix bugs in development

```bash
git checkout develop
git checkout -b bugfix/fix-person-validation
# Fix the bug
git push origin bugfix/fix-person-validation
# Create PR to develop
```

#### Hotfix Branches
- **Naming**: `hotfix/<version>` (e.g., `hotfix/1.2.1`)
- **Branch from**: `main`
- **Merge back into**: `main` AND `develop`
- **Purpose**: Emergency fixes for production

```bash
git checkout main
git checkout -b hotfix/1.2.1
# Fix the critical issue
git push origin hotfix/1.2.1
# Create PR to main
# After merge, also merge into develop
```

#### Release Branches
- **Naming**: `release/<version>` (e.g., `release/1.3.0`)
- **Branch from**: `develop`
- **Merge back into**: `main` AND `develop`
- **Purpose**: Prepare a new production release

```bash
git checkout develop
git checkout -b release/1.3.0
# Update version numbers, changelog, final testing
git push origin release/1.3.0
# Create PR to staging, then to main
```

## Workflow

### 1. Regular Development Flow

```
develop → feature/xxx → develop → staging → main
```

1. Create feature branch from `develop`
2. Develop and commit changes
3. Create PR to `develop`
4. After review and merge, changes go to `develop`
5. When ready for release, merge `develop` to `staging`
6. After testing, merge `staging` to `main`
7. Tag release in `main`

### 2. Hotfix Flow

```
main → hotfix/x.x.x → main
                   → develop
```

1. Create hotfix branch from `main`
2. Fix critical issue
3. Merge to `main` with new patch version
4. Merge to `develop` to keep in sync

## Version Management

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (v1.0.0 → v2.0.0)
- **MINOR**: New features, backward compatible (v1.0.0 → v1.1.0)
- **PATCH**: Bug fixes, backward compatible (v1.0.0 → v1.0.1)

## Pull Request Guidelines

1. **Target the correct branch**:
   - Features/bugfixes → `develop`
   - Releases → `staging` then `main`
   - Hotfixes → `main` then `develop`

2. **Include**:
   - Clear description of changes
   - Reference to related issues
   - Tests for new features
   - Updated documentation if needed

3. **Before submitting**:
   - Ensure all tests pass
   - Update CHANGELOG.md
   - Follow code style guidelines
   - Rebase on target branch if needed

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/RocketSchema.git`
3. Add upstream remote: `git remote add upstream https://github.com/RocketPHP-org/RocketSchema.git`
4. Create a feature branch: `git checkout -b feature/my-feature develop`
5. Make your changes and commit
6. Push to your fork: `git push origin feature/my-feature`
7. Create a Pull Request to `develop`

## Questions?

If you have questions about the contribution process, please open an issue or reach out to the maintainers.

---

Thank you for helping make RocketSchema better!
