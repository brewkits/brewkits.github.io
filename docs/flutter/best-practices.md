---
sidebar_position: 3
---

# Flutter Best Practices

BrewKits' recommended best practices for Flutter package development.

## Code Organization

### 1. Directory Structure

```
lib/
├── src/
│   ├── models/
│   ├── services/
│   ├── widgets/
│   └── utils/
└── my_package.dart    # Public API
```

### 2. Public API Design

Only export what users need:

```dart
// ✅ Good
library my_package;

export 'src/widgets/awesome_widget.dart';
export 'src/models/awesome_model.dart';

// ❌ Bad - don't export internal utilities
// export 'src/utils/internal_helper.dart';
```

### 3. Use Barrel Files Wisely

```dart
// lib/src/widgets/widgets.dart
export 'awesome_widget.dart';
export 'cool_widget.dart';

// lib/my_package.dart
export 'src/widgets/widgets.dart';
```

## Code Quality

### 1. Enable Strict Linting

Add `flutter_lints` to your `pubspec.yaml`:

```yaml
dev_dependencies:
  flutter_lints: ^4.0.0
```

Create `analysis_options.yaml`:

```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - always_declare_return_types
    - avoid_print
    - prefer_const_constructors
    - prefer_const_declarations
```

### 2. Null Safety

Always use null safety:

```dart
// ✅ Good
String? getName() {
  return name;
}

// Use null-aware operators
final displayName = getName() ?? 'Unknown';

// ❌ Bad - avoid using dynamic
dynamic getData() { }
```

### 3. Immutability

Prefer immutable classes:

```dart
// ✅ Good
class User {
  const User({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  User copyWith({
    String? id,
    String? name,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
    );
  }
}
```

## Documentation

### 1. Dartdoc Comments

Write comprehensive dartdoc for public APIs:

```dart
/// A widget that displays awesome content.
///
/// The [AwesomeWidget] takes a [title] and optional [onTap] callback.
///
/// Example:
/// ```dart
/// AwesomeWidget(
///   title: 'Hello World',
///   onTap: () => print('Tapped!'),
/// )
/// ```
///
/// See also:
///  * [AnotherWidget], which provides similar functionality.
class AwesomeWidget extends StatelessWidget {
  /// Creates an [AwesomeWidget].
  ///
  /// The [title] must not be null.
  const AwesomeWidget({
    super.key,
    required this.title,
    this.onTap,
  });

  /// The title to display.
  final String title;

  /// Called when the widget is tapped.
  final VoidCallback? onTap;
}
```

### 2. README.md

Include these sections:

```markdown
# Package Name

Brief description

## Features

- Feature 1
- Feature 2

## Getting Started

Installation instructions

## Usage

Code examples

## Additional Information

Contributing guidelines, etc.
```

## Testing

### 1. Test Coverage

Aim for >80% coverage:

```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### 2. Unit Tests

Test all business logic:

```dart
void main() {
  group('AwesomeService', () {
    test('calculates correctly', () {
      final service = AwesomeService();
      expect(service.calculate(2, 3), equals(5));
    });

    test('handles edge cases', () {
      final service = AwesomeService();
      expect(() => service.calculate(null, 3), throwsArgumentError);
    });
  });
}
```

### 3. Widget Tests

Test UI components:

```dart
testWidgets('AwesomeWidget displays title', (tester) async {
  await tester.pumpWidget(
    const MaterialApp(
      home: AwesomeWidget(title: 'Test'),
    ),
  );

  expect(find.text('Test'), findsOneWidget);
});
```

## Performance

### 1. Use Const Constructors

```dart
// ✅ Good - uses const
const Text('Hello')

// ❌ Bad - creates new instance each rebuild
Text('Hello')
```

### 2. Avoid Rebuilding Unnecessarily

```dart
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // ✅ Good - extract expensive widgets to const
    return const Column(
      children: [
        _Header(),
        _Footer(),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();
  // ...
}
```

### 3. Lazy Loading

```dart
// ✅ Good - lazy initialization
late final ExpensiveObject _object = ExpensiveObject();

// Use ListView.builder for long lists
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

## Dependencies

### 1. Minimize Dependencies

Only include necessary dependencies:

```yaml
# ✅ Good - minimal dependencies
dependencies:
  flutter:
    sdk: flutter

# ❌ Bad - unnecessary dependencies
dependencies:
  flutter:
    sdk: flutter
  lodash: ^4.17.21
  moment: ^2.29.4
```

### 2. Version Constraints

Use appropriate version constraints:

```yaml
dependencies:
  # ✅ Good - allows compatible updates
  http: ^1.0.0

  # ❌ Bad - too strict
  http: 1.0.0

  # ❌ Bad - too loose
  http: any
```

## Platform Support

### 1. Specify Supported Platforms

```yaml
# pubspec.yaml
flutter:
  plugin:
    platforms:
      android:
        package: com.brewkits.awesome
        pluginClass: AwesomePlugin
      ios:
        pluginClass: AwesomePlugin
      web:
        pluginClass: AwesomePluginWeb
```

### 2. Test on All Platforms

```bash
# Test on different platforms
flutter test
flutter build apk
flutter build ios
flutter build web
```

## Continuous Integration

### Example GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
      - uses: codecov/codecov-action@v3
```

## Resources

- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Flutter Performance Best Practices](https://flutter.dev/docs/perf/best-practices)
- [Package Development Guide](https://flutter.dev/docs/development/packages-and-plugins/developing-packages)

---

*Follow these practices to build packages that the community loves!*
