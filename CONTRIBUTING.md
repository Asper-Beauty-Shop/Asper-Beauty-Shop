# Contributing to Asper Beauty Shop

Thank you for your interest in contributing to Asper Beauty Shop! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/asperbeauty.git
   cd asperbeauty
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-product-filters` - New features
- `fix/cart-quantity-bug` - Bug fixes
- `docs/update-readme` - Documentation updates
- `style/header-redesign` - UI/styling changes

### Git Branch Management

#### Creating and Listing Branches

**List all branches:**
```bash
# List local branches
git branch

# List all branches (including remote)
git branch -a

# List remote branches only
git branch -r
```

**Create a new branch:**
```bash
# Create a new branch (but stay on current branch)
git branch feature/new-feature

# Create and switch to a new branch
git checkout -b feature/new-feature

# Create a new branch from a specific commit
git branch feature/new-feature abc1234
```

**Delete a branch:**
```bash
# Delete a local branch (safe - prevents deletion if unmerged)
git branch -d feature/old-feature

# Force delete a local branch
git branch -D feature/old-feature

# Delete a remote branch
git push origin --delete feature/old-feature
```

#### Switching Between Branches

**Using git checkout:**
```bash
# Switch to an existing branch
git checkout main

# Switch to a branch and create it if it doesn't exist
git checkout -b feature/new-feature

# Switch to the previous branch
git checkout -
```

**Using git switch (modern alternative):**
```bash
# Switch to an existing branch
git switch main

# Create and switch to a new branch
git switch -c feature/new-feature

# Switch to the previous branch
git switch -
```

#### Merging Branches

**Basic merge:**
```bash
# Switch to the branch you want to merge INTO
git checkout main

# Merge another branch into current branch
git merge feature/new-feature
```

**Merge with options:**
```bash
# Merge without fast-forward (creates a merge commit)
git merge --no-ff feature/new-feature

# Merge and squash all commits into one
git merge --squash feature/new-feature

# Abort a merge if conflicts occur
git merge --abort
```

**Example workflow:**
```bash
# 1. Create and work on a feature branch
git checkout -b feature/add-wishlist
# ... make changes and commits ...

# 2. Update main branch
git checkout main
git pull origin main

# 3. Merge feature into main
git merge feature/add-wishlist

# 4. Push changes
git push origin main

# 5. Delete feature branch
git branch -d feature/add-wishlist
git push origin --delete feature/add-wishlist
```

#### Rebasing Branches

**Basic rebase:**
```bash
# Switch to your feature branch
git checkout feature/new-feature

# Rebase onto main
git rebase main
```

**Interactive rebase:**
```bash
# Rebase and edit last 3 commits
git rebase -i HEAD~3

# Rebase interactively onto main
git rebase -i main
```

**Handling rebase conflicts:**
```bash
# After resolving conflicts in files, stage them
# Use specific files or check with 'git status' first
git add <resolved-files>

# Continue the rebase
git rebase --continue

# Skip the current commit if needed
git rebase --skip

# Abort the rebase and return to original state
git rebase --abort
```

**Example workflow:**
```bash
# 1. You're working on a feature branch
git checkout feature/add-filters

# 2. Main branch has new commits, rebase to get them
git fetch origin
git rebase origin/main

# 3. If conflicts occur, resolve them
# Edit conflicting files, then stage the resolved files
git add <resolved-files>
git rebase --continue

# 4. Force push your rebased branch
# WARNING: Force push overwrites remote history. Only use on personal feature branches!
# Never force push to shared branches (main, develop, etc.) as it can cause data loss.
# --force-with-lease checks that your local ref is up-to-date before forcing,
# preventing accidental overwrites of others' work.
git push --force-with-lease origin feature/add-filters
```

#### Merge vs Rebase: When to Use Each

**Use `git merge` when:**
- Working on a shared/public branch
- You want to preserve complete history
- Working on main/master branch
- You want to show when features were integrated

**Use `git rebase` when:**
- Cleaning up local commits before sharing
- You want a linear history
- Working on a personal feature branch
- Updating your branch with latest main changes

**Example comparison:**
```bash
# Scenario: Feature branch needs updates from main

# Option 1: Merge (preserves history)
git checkout feature/my-feature
git merge main
# Creates a merge commit, shows divergent history

# Option 2: Rebase (linear history)
git checkout feature/my-feature
git rebase main
# Replays your commits on top of main, linear history
```

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Styling/formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(cart): add quantity selector to cart items
fix(search): resolve dropdown not closing on blur
docs(readme): update installation instructions
```

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks

### Styling

- Use Tailwind CSS utility classes
- Follow the design system tokens defined in `src/index.css`
- Use semantic color tokens (e.g., `text-foreground`, `bg-primary`)
- Never use hardcoded colors directly

### File Structure

```
src/
├── components/       # Reusable components
│   └── ui/          # shadcn/ui base components
├── pages/           # Route pages
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── stores/          # Zustand stores
└── contexts/        # React contexts
```

## 🔍 Code Review Guidelines

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] Code follows the project's style guidelines
- [ ] Components are responsive (mobile, tablet, desktop)
- [ ] RTL support is maintained for Arabic language
- [ ] No console errors or warnings

### Pull Request Process

1. Create a pull request with a clear title and description
2. Link any related issues
3. Wait for review from maintainers
4. Address any requested changes
5. Once approved, your PR will be merged

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: How to trigger the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, device

## 💡 Feature Requests

For feature requests, please provide:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives Considered**: Other approaches you've thought about
4. **Additional Context**: Mockups, examples, etc.

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand State Management](https://zustand-demo.pmnd.rs)
- [Lovable Documentation](https://docs.lovable.dev)

## 📧 Contact

For questions or support:
- Create an issue in this repository
- Join our community on [Discord](https://discord.gg/lovable-dev)

---

Thank you for contributing! 🙏
