# Contributing to aigito

Thank you for your interest in contributing to aigito! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/xyassini/aigito.git`
3. Install dependencies: `bun install`
4. Run tests: `bun test`
5. Make your changes
6. Run tests again to ensure nothing broke
7. Submit a pull request

## 💻 Development Setup

### Prerequisites
- [Bun](https://bun.sh) (v1.0+)
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) (v18+) for testing compatibility

### Local Development
```bash
# Clone the repository
git clone https://github.com/xyassini/aigito.git
cd aigito

# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Build the project
bun run build

# Test the CLI locally
node dist/index.js --help
```

## 📝 Coding Standards

### Code Style
- Use TypeScript for all code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages
We use [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

Examples:
```
feat(ai): add support for GPT-4 turbo
fix(git): handle deleted files correctly
docs: update README with new examples
test(utils): add tests for validation functions
```

### File Organization
```
src/
├── ai.ts          # AI integration
├── diff.ts        # Diff calculation
├── git.ts         # Git operations
├── utils.ts       # Utility functions
└── types.ts       # Type definitions
```

## 🧪 Testing

### Writing Tests
- All new features must include tests
- Use Bun's built-in test runner
- Follow the existing test patterns
- Test both success and error cases
- Mock external dependencies (git, filesystem, etc.)

### Test Structure
```typescript
import { describe, it, expect, mock } from "bun:test";

describe("moduleName", () => {
  describe("functionName", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test input";
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe("expected output");
    });
  });
});
```

### Running Tests
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/ai.spec.ts
```

## 📋 Pull Request Process

### Before Submitting
1. ✅ Ensure all tests pass: `bun test`
2. ✅ Build successfully: `bun run build`
3. ✅ Follow conventional commit format
4. ✅ Add tests for new features
5. ✅ Update documentation if needed

### PR Guidelines
- **Title**: Use conventional commit format
- **Description**: Explain what changes and why
- **Testing**: Describe how you tested the changes
- **Breaking Changes**: Clearly mark any breaking changes

### PR Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
```

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues for duplicates
2. Test with the latest version
3. Gather relevant information

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What should have happened

**Environment:**
- OS: [e.g. macOS 14.0]
- Node version: [e.g. 18.17.0]
- Bun version: [e.g. 1.0.0]
- aigito version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting
1. Check existing issues for similar requests
2. Consider if it fits the project scope
3. Think about implementation approach

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of the desired feature

**Describe alternatives you've considered**
Alternative solutions or workarounds

**Additional context**
Any other relevant information
```

## 🏗️ Development Guidelines

### Adding New Features
1. **Planning**: Discuss large features in an issue first
2. **Implementation**: Start with tests, then implement
3. **Documentation**: Update README and add examples
4. **Testing**: Ensure comprehensive test coverage

### Modifying Existing Features
1. **Backward Compatibility**: Avoid breaking changes when possible
2. **Migration Path**: Provide clear migration for breaking changes
3. **Deprecation**: Mark deprecated features clearly

### Performance Considerations
- Keep the CLI fast and responsive
- Minimize external dependencies
- Use efficient algorithms for diff calculation
- Cache expensive operations when possible

## 🔒 Security

### Security Considerations
- Never log API keys or sensitive data
- Validate all user inputs
- Use secure methods for file operations
- Follow OWASP guidelines for CLI tools

### Reporting Security Issues
Please see [SECURITY.md](SECURITY.md) for our security policy.

## 📚 Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

### Tools
- [isomorphic-git API](https://isomorphic-git.org/docs/en/quickstart)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [yargs Documentation](https://yargs.js.org/)

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Added to the contributors list

## ❓ Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Create issues for bugs and feature requests
- 📧 **Email**: Contact maintainers for urgent matters

Thank you for contributing to aigito! 🚀 