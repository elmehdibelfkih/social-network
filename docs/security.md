# Security Documentation - Utils Functions

## Error Logging (`errors.go`)

**InitLogger()** - Initialize log files

```go
utils.InitLogger()
defer utils.CloseLogger()
```

**LogSQLiteError(err, query)** - Log database errors

```go
utils.LogSQLiteError(err, "SELECT * FROM users")
```

**LogBackendError(context, err)** - Log backend errors

```go
utils.LogBackendError("authentication", err)
```

**HandleSQLiteError(err, query)** - Log and return true if error exists

```go
if utils.HandleSQLiteError(err, query) {
    return
}
```

**HandleBackendError(context, err)** - Log and return true if error exists

```go
if utils.HandleBackendError("login", err) {
    return
}
```

## ID Generation (`id-generator.go`)

**GenerateID()** - Generate unique snowflake ID

```go
id := utils.GenerateID()
```

**SortIDs(ids)** - Sort array of IDs

```go
sorted := utils.SortIDs([]uint64{123, 456, 789})
```

## Validation (`validation.go`)

**emailvalidation(email)** - Validate email format

```go
valid := utils.emailvalidation("user@example.com")
```

**passwordvalidation(password)** - Validate password strength

```go
valid, msg := utils.passwordvalidation("MyPass123!")
```

**firstnamelastname(name)** - Validate name format

```go
valid := utils.firstnamelastname("John Doe")
```

**datevalidation(date)** - Validate date format (yyyy-mm-dd)

```go
valid := utils.datevalidation("2024-01-15")
```

## Log Files Location

- SQLite errors: `logs/backend-sqlite.log`
- Backend errors: `logs/backend.log`
