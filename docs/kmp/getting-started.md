---
sidebar_position: 1
---

# Getting Started with Kotlin Multiplatform

Learn how to build cross-platform libraries with Kotlin Multiplatform (KMP).

## What is Kotlin Multiplatform?

Kotlin Multiplatform allows you to share code between multiple platforms while maintaining native performance. Write your business logic once and use it across:

- **Android** (native)
- **iOS** (native)
- **Web** (JavaScript/Wasm)
- **Desktop** (JVM, Windows, macOS, Linux)
- **Server** (JVM, Node.js)

## Prerequisites

Before you begin, install:

- **JDK** 17 or higher
- **Kotlin** 1.9.0 or higher
- **Gradle** 8.0 or higher
- **Android Studio** or **IntelliJ IDEA**
- **Xcode** (for iOS development on macOS)

## Setting Up Your Environment

### 1. Verify Installation

```bash
java -version
kotlin -version
gradle --version
```

### 2. Create a New KMP Library

Using the Kotlin Multiplatform wizard:

```bash
# Using IntelliJ IDEA or Android Studio
# File → New → Project → Kotlin Multiplatform Library
```

Or use the Gradle template:

```bash
mkdir my-kmp-library
cd my-kmp-library
gradle init --type kotlin-library
```

## Project Structure

A typical KMP library structure:

```
my-kmp-library/
├── src/
│   ├── commonMain/
│   │   └── kotlin/           # Shared code
│   ├── androidMain/
│   │   └── kotlin/           # Android-specific
│   ├── iosMain/
│   │   └── kotlin/           # iOS-specific
│   ├── jvmMain/
│   │   └── kotlin/           # JVM-specific
│   └── jsMain/
│       └── kotlin/           # JavaScript-specific
├── build.gradle.kts
├── gradle.properties
└── settings.gradle.kts
```

## Basic Configuration

### build.gradle.kts

```kotlin
plugins {
    kotlin("multiplatform") version "1.9.20"
    id("com.android.library")
    id("maven-publish")
}

group = "dev.brewkits"
version = "1.0.0"

kotlin {
    // Configure targets
    android()
    ios()
    iosSimulatorArm64()

    jvm()
    js(IR) {
        browser()
        nodejs()
    }

    // Configure source sets
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
            }
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }

        val androidMain by getting {
            dependencies {
                implementation("androidx.core:core-ktx:1.12.0")
            }
        }

        val iosMain by getting
        val iosSimulatorArm64Main by getting {
            dependsOn(iosMain)
        }
    }
}

android {
    namespace = "dev.brewkits.library"
    compileSdk = 34

    defaultConfig {
        minSdk = 24
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

## Writing Shared Code

### Common Code (commonMain)

```kotlin
// src/commonMain/kotlin/dev/brewkits/library/Greeting.kt
package dev.brewkits.library

class Greeting {
    fun greet(): String {
        return "Hello from ${getPlatform().name}!"
    }
}

expect fun getPlatform(): Platform

interface Platform {
    val name: String
}
```

### Platform-Specific Implementations

**Android (androidMain):**

```kotlin
// src/androidMain/kotlin/dev/brewkits/library/Platform.android.kt
package dev.brewkits.library

actual fun getPlatform(): Platform = AndroidPlatform()

class AndroidPlatform : Platform {
    override val name: String = "Android ${android.os.Build.VERSION.SDK_INT}"
}
```

**iOS (iosMain):**

```kotlin
// src/iosMain/kotlin/dev/brewkits/library/Platform.ios.kt
package dev.brewkits.library

import platform.UIKit.UIDevice

actual fun getPlatform(): Platform = IOSPlatform()

class IOSPlatform : Platform {
    override val name: String =
        "${UIDevice.currentDevice.systemName()} ${UIDevice.currentDevice.systemVersion}"
}
```

## Testing

### Common Tests

```kotlin
// src/commonTest/kotlin/dev/brewkits/library/GreetingTest.kt
package dev.brewkits.library

import kotlin.test.Test
import kotlin.test.assertTrue

class GreetingTest {
    @Test
    fun testGreeting() {
        val greeting = Greeting().greet()
        assertTrue(greeting.contains("Hello"))
    }
}
```

### Run Tests

```bash
# Run all tests
./gradlew allTests

# Run tests for specific platform
./gradlew jvmTest
./gradlew androidInstrumentedTest
./gradlew iosSimulatorArm64Test
```

## Building

```bash
# Build all targets
./gradlew build

# Build specific target
./gradlew jvmJar
./gradlew assembleDebug  # Android
./gradlew linkDebugFrameworkIosArm64  # iOS
```

## Best Practices

### 1. Maximize Shared Code

Put as much logic as possible in `commonMain`:

```kotlin
// ✅ Good - business logic in commonMain
class UserRepository {
    fun validateEmail(email: String): Boolean {
        return email.contains("@")
    }
}

// Platform-specific only for platform APIs
expect class NetworkClient() {
    fun makeRequest(url: String): String
}
```

### 2. Use expect/actual for Platform APIs

```kotlin
// commonMain
expect class FileStorage {
    fun save(key: String, value: String)
    fun load(key: String): String?
}

// androidMain
actual class FileStorage {
    private val prefs = /* SharedPreferences */

    actual fun save(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }
}

// iosMain
actual class FileStorage {
    actual fun save(key: String, value: String) {
        NSUserDefaults.standardUserDefaults.setObject(value, key)
    }
}
```

### 3. Leverage Kotlin Coroutines

```kotlin
class DataService {
    suspend fun fetchData(): Result<Data> = withContext(Dispatchers.IO) {
        try {
            val response = api.fetch()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

## Next Steps

- [Publishing to klibs.io](./publishing.md)
- [Best Practices](./best-practices.md)
- [Advanced Patterns](#) (Coming Soon)

## Resources

- [Kotlin Multiplatform Docs](https://kotlinlang.org/docs/multiplatform.html)
- [KMP Samples](https://github.com/Kotlin/kmm-samples)
- [Touchlab KMP Resources](https://touchlab.co/kmp-learning-resources)

---

*Start building once, deploy everywhere with Kotlin Multiplatform!*
