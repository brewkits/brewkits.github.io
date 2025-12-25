---
sidebar_position: 3
---

# KMP Best Practices

BrewKits' recommended best practices for Kotlin Multiplatform development.

## Project Structure

### 1. Organize by Feature

```
src/
├── commonMain/
│   └── kotlin/
│       └── dev/brewkits/library/
│           ├── auth/
│           │   ├── AuthService.kt
│           │   ├── AuthRepository.kt
│           │   └── models/
│           ├── network/
│           │   ├── ApiClient.kt
│           │   └── models/
│           └── utils/
├── androidMain/
│   └── kotlin/
│       └── dev/brewkits/library/
│           ├── auth/
│           │   └── AuthService.android.kt
│           └── network/
│               └── ApiClient.android.kt
└── iosMain/
    └── kotlin/
        └── dev/brewkits/library/
            ├── auth/
            │   └── AuthService.ios.kt
            └── network/
                └── ApiClient.ios.kt
```

### 2. Shared Models in commonMain

```kotlin
// commonMain
data class User(
    val id: String,
    val name: String,
    val email: String,
    val createdAt: Long
)

data class ApiResponse<T>(
    val data: T?,
    val error: String?,
    val isSuccess: Boolean
)
```

## Code Sharing Strategies

### 1. Maximize Common Code

Put as much as possible in `commonMain`:

```kotlin
// ✅ Good - pure Kotlin in commonMain
class UserValidator {
    fun validateEmail(email: String): Boolean {
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$".toRegex()
        return email.matches(emailRegex)
    }

    fun validatePassword(password: String): Boolean {
        return password.length >= 8
    }
}

// ✅ Good - business logic shared
class AuthRepository(
    private val apiClient: ApiClient,
    private val storage: SecureStorage
) {
    suspend fun login(email: String, password: String): Result<User> {
        return try {
            val response = apiClient.post("/auth/login", mapOf(
                "email" to email,
                "password" to password
            ))
            storage.saveToken(response.token)
            Result.success(response.user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 2. Use expect/actual for Platform APIs

```kotlin
// commonMain
expect class SecureStorage {
    fun saveToken(token: String)
    fun getToken(): String?
    fun clearToken()
}

// androidMain
import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

actual class SecureStorage(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    actual fun saveToken(token: String) {
        prefs.edit().putString("auth_token", token).apply()
    }

    actual fun getToken(): String? {
        return prefs.getString("auth_token", null)
    }

    actual fun clearToken() {
        prefs.edit().remove("auth_token").apply()
    }
}

// iosMain
import platform.Foundation.NSUserDefaults

actual class SecureStorage {
    private val keychain = /* Keychain wrapper */

    actual fun saveToken(token: String) {
        keychain.set(token, forKey = "auth_token")
    }

    actual fun getToken(): String? {
        return keychain.string(forKey = "auth_token")
    }

    actual fun clearToken() {
        keychain.delete(forKey = "auth_token")
    }
}
```

### 3. Interfaces Over expect/actual

Prefer interfaces when possible:

```kotlin
// commonMain
interface Logger {
    fun log(message: String)
    fun error(message: String, throwable: Throwable?)
}

class DefaultLogger : Logger {
    override fun log(message: String) {
        println(message)
    }

    override fun error(message: String, throwable: Throwable?) {
        println("ERROR: $message")
        throwable?.printStackTrace()
    }
}

// Dependency injection
class UserService(
    private val logger: Logger = DefaultLogger()
) {
    fun processUser(user: User) {
        logger.log("Processing user: ${user.name}")
    }
}
```

## Concurrency

### 1. Use Coroutines

```kotlin
class DataRepository(
    private val api: ApiClient,
    private val cache: Cache
) {
    suspend fun fetchData(): Result<Data> = withContext(Dispatchers.IO) {
        try {
            // Try cache first
            cache.get("data")?.let { cached ->
                return@withContext Result.success(cached)
            }

            // Fetch from network
            val response = api.getData()
            cache.set("data", response)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun observeData(): Flow<Data> = flow {
        while (true) {
            val data = fetchData().getOrNull()
            data?.let { emit(it) }
            delay(5000) // Poll every 5 seconds
        }
    }.flowOn(Dispatchers.IO)
}
```

### 2. StateFlow for State Management

```kotlin
class UserViewModel {
    private val _userState = MutableStateFlow<UserState>(UserState.Initial)
    val userState: StateFlow<UserState> = _userState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _userState.value = UserState.Loading

            val result = authRepository.login(email, password)

            _userState.value = when {
                result.isSuccess -> UserState.Success(result.getOrNull()!!)
                else -> UserState.Error(result.exceptionOrNull()?.message)
            }
        }
    }
}

sealed class UserState {
    object Initial : UserState()
    object Loading : UserState()
    data class Success(val user: User) : UserState()
    data class Error(val message: String?) : UserState()
}
```

## Networking

### 1. Use Ktor for HTTP

```kotlin
// commonMain
class ApiClient {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }

        install(Logging) {
            logger = Logger.DEFAULT
            level = LogLevel.INFO
        }

        defaultRequest {
            url("https://api.brewkits.dev/v1/")
            header(HttpHeaders.ContentType, ContentType.Application.Json)
        }
    }

    suspend fun <T> get(
        endpoint: String,
        responseType: KClass<T>
    ): T {
        return client.get(endpoint).body()
    }

    suspend fun <T> post(
        endpoint: String,
        body: Any,
        responseType: KClass<T>
    ): T {
        return client.post(endpoint) {
            setBody(body)
        }.body()
    }
}
```

## Data Persistence

### 1. Use SQLDelight

```kotlin
// commonMain
class UserDatabase(driver: SqlDriver) {
    private val database = Database(driver)

    fun insertUser(user: User) {
        database.userQueries.insert(
            id = user.id,
            name = user.name,
            email = user.email
        )
    }

    fun getUser(id: String): User? {
        return database.userQueries.selectById(id).executeAsOneOrNull()?.let {
            User(
                id = it.id,
                name = it.name,
                email = it.email
            )
        }
    }

    fun observeUsers(): Flow<List<User>> {
        return database.userQueries.selectAll()
            .asFlow()
            .mapToList()
            .map { list -> list.map { /* map to User */ } }
    }
}

// androidMain
actual class DatabaseDriverFactory(private val context: Context) {
    actual fun createDriver(): SqlDriver {
        return AndroidSqliteDriver(
            Database.Schema,
            context,
            "brewkits.db"
        )
    }
}

// iosMain
actual class DatabaseDriverFactory {
    actual fun createDriver(): SqlDriver {
        return NativeSqliteDriver(
            Database.Schema,
            "brewkits.db"
        )
    }
}
```

## Testing

### 1. Shared Tests in commonTest

```kotlin
class UserValidatorTest {
    private val validator = UserValidator()

    @Test
    fun `valid email should return true`() {
        assertTrue(validator.validateEmail("test@brewkits.dev"))
    }

    @Test
    fun `invalid email should return false`() {
        assertFalse(validator.validateEmail("invalid-email"))
    }

    @Test
    fun `password with 8+ chars should be valid`() {
        assertTrue(validator.validatePassword("password123"))
    }
}
```

### 2. Mock Platform Dependencies

```kotlin
class MockSecureStorage : SecureStorage {
    private val storage = mutableMapOf<String, String>()

    override fun saveToken(token: String) {
        storage["auth_token"] = token
    }

    override fun getToken(): String? {
        return storage["auth_token"]
    }

    override fun clearToken() {
        storage.remove("auth_token")
    }
}

class AuthRepositoryTest {
    private val mockStorage = MockSecureStorage()
    private val mockApi = MockApiClient()
    private val repository = AuthRepository(mockApi, mockStorage)

    @Test
    fun `login should save token`() = runTest {
        val result = repository.login("test@brewkits.dev", "password123")

        assertTrue(result.isSuccess)
        assertNotNull(mockStorage.getToken())
    }
}
```

## Dependency Injection

### Use Koin

```kotlin
// commonMain
val appModule = module {
    single<Logger> { DefaultLogger() }
    single { ApiClient() }
    single { SecureStorage() }
    single { AuthRepository(get(), get()) }
    factory { UserViewModel(get()) }
}

// Initialize in app
fun initKoin() {
    startKoin {
        modules(appModule)
    }
}

// Usage
class MyScreen {
    private val viewModel: UserViewModel by inject()
}
```

## Performance

### 1. Lazy Initialization

```kotlin
class HeavyResource {
    companion object {
        val instance: HeavyResource by lazy {
            HeavyResource().apply {
                // Expensive initialization
            }
        }
    }
}
```

### 2. Optimize expect/actual

```kotlin
// ❌ Bad - separate expect/actual for each function
expect fun getCurrentTime(): Long
expect fun formatTime(time: Long): String
expect fun parseTime(str: String): Long

// ✅ Good - single interface
expect class TimeUtil {
    fun getCurrentTime(): Long
    fun formatTime(time: Long): String
    fun parseTime(str: String): Long
}
```

## Documentation

### KDoc Comments

```kotlin
/**
 * Manages user authentication and authorization.
 *
 * This repository handles login, logout, and token management
 * across all supported platforms.
 *
 * @property apiClient The API client for network requests
 * @property storage Secure storage for tokens
 *
 * @constructor Creates an AuthRepository with the given dependencies
 */
class AuthRepository(
    private val apiClient: ApiClient,
    private val storage: SecureStorage
) {
    /**
     * Authenticates a user with email and password.
     *
     * @param email User's email address
     * @param password User's password
     * @return Result containing the authenticated User or an error
     *
     * @throws NetworkException if network request fails
     */
    suspend fun login(email: String, password: String): Result<User> {
        // Implementation
    }
}
```

## Resources

- [Kotlin Multiplatform Best Practices](https://kotlinlang.org/docs/multiplatform-best-practices.html)
- [Touchlab KMP Guide](https://touchlab.co/kmp-best-practices)
- [JetBrains KMP Samples](https://github.com/Kotlin/kmm-samples)

---

*Build robust, maintainable KMP libraries!*
