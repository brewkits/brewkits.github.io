---
slug: kmp-getting-started
title: Getting Started with Kotlin Multiplatform
authors: [brewkits]
tags: [kotlin, kmp, multiplatform, tutorial]
---

# Getting Started with Kotlin Multiplatform

Kotlin Multiplatform (KMP) is revolutionizing cross-platform development. Let's explore why and how to get started!

<!-- truncate -->

## What is Kotlin Multiplatform?

Kotlin Multiplatform allows you to write code once and share it across multiple platforms:

- **Android** (native performance)
- **iOS** (native performance)
- **Web** (JavaScript/Wasm)
- **Desktop** (JVM, Windows, macOS, Linux)
- **Server** (JVM, Node.js)

Unlike other cross-platform solutions, KMP lets you share **what makes sense** while keeping platform-specific code where needed.

## Why Choose KMP?

### True Native Performance

KMP compiles to native code for each platform - no bridge, no virtual machine overhead.

### Gradual Adoption

Start by sharing a small piece of code and gradually increase sharing as you get comfortable.

### Type Safety

Kotlin's strong type system catches errors at compile time, not runtime.

### Modern Language Features

- Null safety
- Coroutines for async programming
- Extension functions
- Data classes
- And much more!

## Setting Up Your First KMP Project

### Prerequisites

Install:

- JDK 17+
- Android Studio or IntelliJ IDEA
- Xcode (for iOS development on macOS)
- Kotlin 1.9.0+

### Create a New Project

```bash
# Using IntelliJ IDEA
File → New → Project → Kotlin Multiplatform Library
```

## Your First Shared Code

### Common Code (Shared Logic)

```kotlin
// commonMain/kotlin/Greeting.kt
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

**Android:**

```kotlin
// androidMain/kotlin/Platform.android.kt
actual fun getPlatform(): Platform = AndroidPlatform()

class AndroidPlatform : Platform {
    override val name: String =
        "Android ${android.os.Build.VERSION.SDK_INT}"
}
```

**iOS:**

```kotlin
// iosMain/kotlin/Platform.ios.kt
actual fun getPlatform(): Platform = IOSPlatform()

class IOSPlatform : Platform {
    override val name: String =
        UIDevice.currentDevice.systemName() + " " +
        UIDevice.currentDevice.systemVersion
}
```

## Testing Your Shared Code

```kotlin
// commonTest/kotlin/GreetingTest.kt
class GreetingTest {
    @Test
    fun testGreeting() {
        val greeting = Greeting().greet()
        assertTrue(greeting.contains("Hello"))
    }
}
```

Run tests:

```bash
./gradlew allTests
```

## Real-World Use Cases

### 1. Networking & API Clients

Share HTTP client logic using Ktor:

```kotlin
class ApiClient {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json()
        }
    }

    suspend fun fetchUsers(): List<User> {
        return client.get("https://api.example.com/users").body()
    }
}
```

### 2. Business Logic

```kotlin
class UserValidator {
    fun validateEmail(email: String): Boolean {
        return email.contains("@") && email.length > 5
    }

    fun validatePassword(password: String): Boolean {
        return password.length >= 8
    }
}
```

### 3. Data Models

```kotlin
@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String
)
```

### 4. Database Layer

Using SQLDelight:

```kotlin
class UserRepository(private val database: Database) {
    fun getUser(id: String): User? {
        return database.userQueries.selectById(id).executeAsOneOrNull()
    }

    fun saveUser(user: User) {
        database.userQueries.insert(user.id, user.name, user.email)
    }
}
```

## Common Patterns

### State Management with StateFlow

```kotlin
class UserViewModel {
    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users.asStateFlow()

    fun loadUsers() {
        viewModelScope.launch {
            _users.value = repository.fetchUsers()
        }
    }
}
```

### Dependency Injection with Koin

```kotlin
val appModule = module {
    single { ApiClient() }
    single { UserRepository(get()) }
    factory { UserViewModel(get()) }
}

fun initKoin() {
    startKoin {
        modules(appModule)
    }
}
```

## What to Share vs. What to Keep Native

### ✅ Great Candidates for Sharing

- Business logic
- Data models
- Networking code
- Data persistence
- Validation logic
- Utilities and helpers

### ❌ Keep Platform-Specific

- UI (use native frameworks)
- Platform-specific APIs (camera, location, etc.)
- Platform-specific optimizations
- Deep platform integrations

## Next Steps

Ready to dive deeper? Check out:

- [KMP Best Practices](/docs/kmp/best-practices)
- [Publishing KMP Libraries](/docs/kmp/publishing)
- [Advanced KMP Patterns](#) (Coming Soon)

## Resources

- [Official KMP Documentation](https://kotlinlang.org/docs/multiplatform.html)
- [KMP Samples](https://github.com/Kotlin/kmm-samples)
- [BrewKits GitHub](https://github.com/brewkits)

---

*Ready to build once and deploy everywhere? Join us on this journey!*
