# Contributing to Asper Beauty Shop

Thank you for your interest in contributing to Asper Beauty Shop! This document
provides guidelines and instructions for contributing.

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

## ✅ Define the work (reduce back-and-forth)

Before starting anything beyond a tiny change, write down:

- **Problem statement**: what’s broken/missing and who it affects
- **Scope**: in-scope vs out-of-scope
- **Acceptance criteria (Definition of Done)**: verifiable bullets
  (Given/When/Then is great)
- **Constraints**: performance, accessibility, security/privacy, and **English +
  Arabic (RTL)** support
- **Testing plan**: what to test and where regressions might occur

There’s a short checklist you can reuse in `docs/task-definition.md`.

### Branch Naming

Use descriptive branch names:

- `feature/add-product-filters` - New features
- `fix/cart-quantity-bug` - Bug fixes
- `docs/update-readme` - Documentation updates
- `style/header-redesign` - UI/styling changes

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
