---
sidebar_position: 2
---

# Publishing Flutter Packages to pub.dev

A comprehensive guide to publishing your Flutter package to pub.dev.

## Pre-Publishing Checklist

Before publishing, ensure your package meets these requirements:

### 1. Package Metadata (pubspec.yaml)

```yaml
name: my_awesome_package
description: A clear, concise description (60-180 characters)
version: 1.0.0
homepage: https://brewkits.dev
repository: https://github.com/brewkits/my_awesome_package

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.0.0'

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
```

### 2. Required Files

- **README.md**: Comprehensive documentation
- **CHANGELOG.md**: Version history
- **LICENSE**: Choose an appropriate license (MIT, BSD, Apache 2.0)
- **pubspec.yaml**: Complete metadata
- **example/**: Working example app

### 3. Code Quality

```bash
# Run static analysis
flutter analyze

# Run tests
flutter test

# Check formatting
dart format --output=none --set-exit-if-changed .

# Check pub score
dart pub publish --dry-run
```

## Publishing Steps

### 1. Prepare Your Package

Make sure all tests pass and documentation is complete:

```bash
# Format code
dart format .

# Analyze code
flutter analyze

# Run tests
flutter test

# Check package
dart pub publish --dry-run
```

### 2. Create a Git Tag

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 3. Publish to pub.dev

```bash
dart pub publish
```

Follow the prompts to authenticate and confirm publication.

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (1.0.0 → 2.0.0): Breaking changes
- **MINOR** version (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** version (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Examples

```yaml
# Initial release
version: 1.0.0

# Bug fix
version: 1.0.1

# New feature (backward compatible)
version: 1.1.0

# Breaking change
version: 2.0.0
```

## Maintaining Your Package

### Update CHANGELOG.md

```markdown
## 1.0.1

- Fixed bug in AwesomeWidget
- Improved documentation
- Updated dependencies

## 1.0.0

- Initial release
- Added AwesomeWidget
- Added AwesomeService
```

### Respond to Issues

- Monitor GitHub issues and pub.dev comments
- Respond promptly to bug reports
- Consider feature requests carefully

### Keep Dependencies Updated

```bash
flutter pub upgrade
flutter test
```

## Achieving High Pub Scores

pub.dev scores packages on:

1. **Popularity**: Downloads and usage
2. **Likes**: User engagement
3. **Pub Points**: Code quality metrics
   - Follow Dart/Flutter conventions
   - Maintain good documentation
   - Ensure null safety
   - Keep dependencies up-to-date

### Tips for High Scores

- Write comprehensive documentation
- Include practical examples
- Maintain test coverage >80%
- Keep dependencies minimal and updated
- Respond to issues promptly
- Follow Dart style guide

## Troubleshooting

### Common Issues

**Issue**: Package name already taken
```
Solution: Choose a unique name or prefix with your organization
```

**Issue**: Pub score too low
```
Solution: Run `dart pub publish --dry-run` to see improvement suggestions
```

**Issue**: Failed authentication
```
Solution: Run `dart pub login` to authenticate
```

## Resources

- [pub.dev Publishing Guide](https://dart.dev/tools/pub/publishing)
- [Package Layout Conventions](https://dart.dev/tools/pub/package-layout)
- [Semantic Versioning](https://semver.org/)

---

*Need help? Join our [GitHub Discussions](https://github.com/brewkits) or check our [FAQ](#).*
