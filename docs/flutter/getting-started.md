---
sidebar_position: 1
---

# Getting Started with Flutter

Learn how to start building Flutter packages with BrewKits standards.

## Prerequisites

Before you begin, make sure you have:

- **Flutter SDK** installed (latest stable version recommended)
- **Dart SDK** (comes with Flutter)
- **Git** for version control
- A code editor (VS Code, Android Studio, or IntelliJ IDEA)

## Setting Up Your Environment

### 1. Verify Flutter Installation

```bash
flutter --version
flutter doctor
```

Make sure all checks pass before proceeding.

### 2. Create a New Flutter Package

```bash
flutter create --template=package my_awesome_package
cd my_awesome_package
```

## Package Structure

A well-structured Flutter package should have:

```
my_awesome_package/
├── lib/
│   ├── src/           # Private implementation
│   └── my_awesome_package.dart  # Public API
├── test/              # Unit tests
├── example/           # Example app
├── pubspec.yaml       # Package metadata
├── README.md          # Documentation
├── CHANGELOG.md       # Version history
└── LICENSE            # License file
```

## Best Practices

### 1. API Design

- Keep your public API clean and minimal
- Use the `src/` directory for private implementation
- Export only what's necessary in your main library file

```dart
// lib/my_awesome_package.dart
library my_awesome_package;

export 'src/feature_a.dart';
export 'src/feature_b.dart';
// Don't export internal utilities
```

### 2. Documentation

- Write clear dartdoc comments for all public APIs
- Include code examples in your documentation
- Maintain a comprehensive README.md

```dart
/// A widget that does something awesome.
///
/// Example:
/// ```dart
/// AwesomeWidget(
///   title: 'Hello',
///   onTap: () => print('Tapped!'),
/// )
/// ```
class AwesomeWidget extends StatelessWidget {
  // ...
}
```

### 3. Testing

- Aim for high test coverage (>80%)
- Write unit tests for all business logic
- Include widget tests for UI components

```bash
flutter test --coverage
```

## Next Steps

- [Publishing to pub.dev](./publishing.md)
- [Best Practices](./best-practices.md)
- [BrewKits Examples](#) (Coming Soon)

## Resources

- [Flutter Package Development](https://flutter.dev/docs/development/packages-and-plugins/developing-packages)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [pub.dev Publishing Guide](https://dart.dev/tools/pub/publishing)
