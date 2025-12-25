---
sidebar_position: 2
---

# Publishing KMP Libraries

A comprehensive guide to publishing your Kotlin Multiplatform library.

## Publishing Destinations

You can publish KMP libraries to:

- **Maven Central** - The primary repository for JVM/Android libraries
- **klibs.io** - Kotlin-specific library repository
- **GitHub Packages** - Private or organization-specific packages
- **Custom Maven Repository** - Self-hosted solutions

## Pre-Publishing Checklist

### 1. Complete Metadata

Configure your `build.gradle.kts`:

```kotlin
plugins {
    kotlin("multiplatform") version "1.9.20"
    id("com.android.library")
    id("maven-publish")
    id("signing")
}

group = "dev.brewkits"
version = "1.0.0"

kotlin {
    android {
        publishLibraryVariants("release")
    }
    ios()
    jvm()
    js(IR) {
        browser()
        nodejs()
    }
}
```

### 2. Configure Publishing

```kotlin
publishing {
    publications {
        publications.withType<MavenPublication> {
            pom {
                name.set("My KMP Library")
                description.set("A fantastic Kotlin Multiplatform library")
                url.set("https://brewkits.dev/my-kmp-library")

                licenses {
                    license {
                        name.set("The Apache License, Version 2.0")
                        url.set("http://www.apache.org/licenses/LICENSE-2.0.txt")
                    }
                }

                developers {
                    developer {
                        id.set("brewkits")
                        name.set("BrewKits Team")
                        email.set("team@brewkits.dev")
                    }
                }

                scm {
                    connection.set("scm:git:git://github.com/brewkits/my-kmp-library.git")
                    developerConnection.set("scm:git:ssh://github.com/brewkits/my-kmp-library.git")
                    url.set("https://github.com/brewkits/my-kmp-library")
                }
            }
        }
    }

    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/brewkits/my-kmp-library")
            credentials {
                username = project.findProperty("gpr.user") as String? ?: System.getenv("GITHUB_ACTOR")
                password = project.findProperty("gpr.token") as String? ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}
```

### 3. Sign Your Artifacts

For Maven Central, signing is required:

```kotlin
signing {
    useGpgCmd()
    sign(publishing.publications)
}
```

Configure GPG:

```bash
# Generate key
gpg --gen-key

# List keys
gpg --list-keys

# Export public key
gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
```

Add to `~/.gradle/gradle.properties`:

```properties
signing.gnupg.executable=gpg
signing.gnupg.keyName=YOUR_KEY_ID
```

## Publishing to Maven Central

### 1. Create Sonatype Account

- Visit [Sonatype OSSRH](https://issues.sonatype.org/)
- Create an account
- Create a new project ticket
- Verify domain ownership

### 2. Configure Credentials

Add to `~/.gradle/gradle.properties`:

```properties
sonatypeUsername=your_username
sonatypePassword=your_password
```

### 3. Publish

```bash
./gradlew publishAllPublicationsToMavenCentralRepository
```

### 4. Release

After publishing to staging:

```bash
# Close and release
./gradlew closeAndReleaseRepository
```

## Publishing to GitHub Packages

### 1. Configure Repository

Already shown in the publishing configuration above.

### 2. Set Credentials

```bash
export GITHUB_ACTOR=your_github_username
export GITHUB_TOKEN=your_personal_access_token
```

Or add to `~/.gradle/gradle.properties`:

```properties
gpr.user=your_github_username
gpr.token=your_personal_access_token
```

### 3. Publish

```bash
./gradlew publishAllPublicationsToGitHubPackagesRepository
```

## Publishing to klibs.io

### 1. Create Account

Visit [klibs.io](https://klibs.io) and create an account.

### 2. Generate API Token

In your klibs.io dashboard:
- Go to Settings → API Tokens
- Generate a new token

### 3. Configure Plugin

Add to `build.gradle.kts`:

```kotlin
plugins {
    id("io.klibs.publish") version "1.0.0"
}

klibs {
    apiToken.set(System.getenv("KLIBS_API_TOKEN"))

    library {
        name.set("my-kmp-library")
        description.set("A fantastic KMP library")
        tags.set(listOf("kotlin", "multiplatform", "mobile"))
    }
}
```

### 4. Publish

```bash
export KLIBS_API_TOKEN=your_api_token
./gradlew publishToKlibs
```

## Versioning

Follow [Semantic Versioning](https://semver.org/):

```kotlin
// build.gradle.kts
version = "1.0.0"  // Initial release
version = "1.0.1"  // Bug fix
version = "1.1.0"  // New feature
version = "2.0.0"  // Breaking change
```

## Documentation

### 1. README.md

```markdown
# My KMP Library

## Installation

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("dev.brewkits:my-kmp-library:1.0.0")
}
```

### Gradle (Groovy)

```groovy
dependencies {
    implementation 'dev.brewkits:my-kmp-library:1.0.0'
}
```

## Usage

```kotlin
val greeting = Greeting()
println(greeting.greet())
```

## Supported Platforms

- Android
- iOS
- JVM
- JavaScript

## License

Apache 2.0
```

### 2. API Documentation

Generate KDoc:

```bash
./gradlew dokkaHtml
```

Host on GitHub Pages:

```bash
# Deploy docs
./gradlew dokkaHtml
cp -r build/dokka/html/* docs/
git add docs/
git commit -m "Update documentation"
git push
```

## CI/CD with GitHub Actions

### .github/workflows/publish.yml

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: 17
          distribution: 'temurin'

      - name: Publish to Maven Central
        env:
          SONATYPE_USERNAME: ${{ secrets.SONATYPE_USERNAME }}
          SONATYPE_PASSWORD: ${{ secrets.SONATYPE_PASSWORD }}
          SIGNING_KEY: ${{ secrets.SIGNING_KEY }}
          SIGNING_PASSWORD: ${{ secrets.SIGNING_PASSWORD }}
        run: |
          ./gradlew publishAllPublicationsToMavenCentralRepository
          ./gradlew closeAndReleaseRepository

      - name: Publish to GitHub Packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: ./gradlew publishAllPublicationsToGitHubPackagesRepository
```

## Best Practices

### 1. Changelog

Maintain `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.1] - 2024-01-15

### Fixed
- Fixed crash on iOS when...

### Changed
- Improved performance of...

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Support for Android, iOS, JVM
```

### 2. Git Tags

Tag releases:

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### 3. Release Notes

Create GitHub releases with:
- Version number
- Changelog excerpt
- Breaking changes (if any)
- Migration guide (for major versions)

## Troubleshooting

### Common Issues

**Issue**: Publishing fails with "Unauthorized"
```
Solution: Check your credentials in gradle.properties
```

**Issue**: Signing fails
```
Solution: Verify GPG key is properly configured
gpg --list-secret-keys
```

**Issue**: iOS framework not built
```
Solution: Publishing must be done on macOS with Xcode installed
```

## Resources

- [Maven Central Guide](https://central.sonatype.org/publish/publish-guide/)
- [Kotlin Multiplatform Publishing](https://kotlinlang.org/docs/multiplatform-publish-lib.html)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)

---

*Share your libraries with the world!*
