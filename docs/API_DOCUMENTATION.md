# Heavenletters GraphQL API Documentation

## 📖 **Overview**

The Heavenletters GraphQL API provides access to the complete Heavenletters database, offering spiritual content from Gloria Wendroff's channeled messages. The API serves content from a Drupal 5.x database with full multi-language support.

**Base URL**: `http://localhost:4000/graphql`
**GraphiQL Interface**: `http://localhost:4000/graphql` (interactive query builder)

## 🚀 **Quick Start**

### 1. Access the API
Open your browser and navigate to `http://localhost:4000/graphql` to access the GraphiQL interface for interactive queries.

### 2. Basic Query Example
```graphql
query {
  heavenletters(limit: 3) {
    nid
    title
    number
    author
    created
  }
}
```

### 3. Expected Response
```json
{
  "data": {
    "heavenletters": [
      {
        "nid": 12345,
        "title": "God's Love Surrounds You",
        "number": 4567,
        "author": "Gloria Wendroff",
        "created": "2023-12-01T10:30:00.000Z"
      }
    ]
  }
}
```

## 📋 **Schema Reference**

### Types

#### Heavenletter
```graphql
type Heavenletter {
  nid: ID!           # Unique node identifier
  vid: Int           # Version identifier
  title: String!     # Heavenletter title
  number: Int        # Sequential heavenletter number
  teaser: String     # Preview/excerpt text
  body: String       # Complete heavenletter content
  locale: String     # Language code (en, es, fr, etc.)
  language: String   # Human-readable language name
  created: String    # Creation date (ISO 8601 format)
  changed: String    # Last modification date
  status: Int        # Publication status (1 = published)
  author: String     # Author name
  pid: Int           # Parent translation ID
}
```

#### Translation
```graphql
type Translation {
  nid: ID!           # Node identifier
  title: String      # Translated title
  locale: String     # Language code
  language: String   # Language name
}
```

#### HeavenQuote
```graphql
type HeavenQuote {
  nid: ID!           # Unique identifier
  vid: Int           # Version identifier
  title: String      # Quote title
  quote: String      # Quote content
  author: String     # Author name
  locale: String     # Language code
  created: String    # Creation date
  status: Int        # Publication status
}
```

## 🔍 **Available Queries**

### 1. heavenletters
Get a list of heavenletters with optional filtering and pagination.

**Signature:**
```graphql
heavenletters(
  locale: String,    # Filter by language (optional)
  limit: Int,        # Number of results (default: 10)
  offset: Int        # Skip results (default: 0)
): [Heavenletter]
```

**Examples:**

#### Basic List Query
```graphql
query {
  heavenletters(limit: 5) {
    nid
    title
    number
    locale
    created
    author
  }
}
```

#### Language-Specific Query
```graphql
query {
  heavenletters(locale: "es", limit: 3) {
    nid
    title
    number
    locale
    language
    author
  }
}
```

#### Paginated Query
```graphql
query {
  heavenletters(limit: 10, offset: 20) {
    nid
    title
    number
    created
  }
}
```

### 2. heavenletter
Get a single heavenletter by its node ID.

**Signature:**
```graphql
heavenletter(nid: ID!): Heavenletter
```

**Example:**
```graphql
query {
  heavenletter(nid: 12345) {
    nid
    title
    number
    body
    locale
    language
    author
    created
    changed
  }
}
```

**Response:**
```json
{
  "data": {
    "heavenletter": {
      "nid": 12345,
      "title": "God's Infinite Love",
      "number": 4567,
      "body": "Beloved, today I speak to you of love that knows no bounds...",
      "locale": "en",
      "language": "English",
      "author": "Gloria Wendroff",
      "created": "2023-12-01T10:30:00.000Z",
      "changed": "2023-12-01T10:30:00.000Z"
    }
  }
}
```

### 3. heavenletterByNumber
Find a heavenletter by its sequential number and language.

**Signature:**
```graphql
heavenletterByNumber(
  number: Int!,      # Heavenletter number
  locale: String     # Language code (default: "en")
): Heavenletter
```

**Example:**
```graphql
query {
  heavenletterByNumber(number: 4567, locale: "en") {
    nid
    title
    number
    body
    author
    locale
  }
}
```

### 4. heavenletterTranslations
Get all available translations for a specific heavenletter.

**Signature:**
```graphql
heavenletterTranslations(nid: ID!): [Translation]
```

**Example:**
```graphql
query {
  heavenletterTranslations(nid: 12345) {
    nid
    title
    locale
    language
  }
}
```

**Note**: ⚠️ This query may return incomplete results due to data integrity issues in the legacy database. Individual language queries using the `locale` parameter work correctly.

### 5. heavenQuotes
Get a list of Heaven Quotes (placeholder for future implementation).

**Signature:**
```graphql
heavenQuotes(
  limit: Int,        # Number of results (default: 10)
  offset: Int        # Skip results (default: 0)
): [HeavenQuote]
```

## 🌍 **Multi-Language Support**

### Available Languages
The API supports multiple languages through locale codes:

| Locale | Language   | Example Query |
|--------|------------|---------------|
| `en`   | English    | `heavenletters(locale: "en")` |
| `es`   | Spanish    | `heavenletters(locale: "es")` |
| `fr`   | French     | `heavenletters(locale: "fr")` |
| `de`   | German     | `heavenletters(locale: "de")` |
| `it`   | Italian    | `heavenletters(locale: "it")` |
| `pt`   | Portuguese | `heavenletters(locale: "pt")` |
| `nl`   | Dutch      | `heavenletters(locale: "nl")` |
| `tr`   | Turkish    | `heavenletters(locale: "tr")` |
| `ru`   | Russian    | `heavenletters(locale: "ru")` |
| `hr`   | Croatian   | `heavenletters(locale: "hr")` |

### Language Query Examples

#### Get Spanish Heavenletters
```graphql
query {
  heavenletters(locale: "es", limit: 5) {
    nid
    title
    number
    locale
    language
  }
}
```

#### Get French Heavenletter by Number
```graphql
query {
  heavenletterByNumber(number: 1000, locale: "fr") {
    nid
    title
    number
    locale
    language
    body
  }
}
```

## 📊 **Response Format**

All GraphQL responses follow the standard format:

### Success Response
```json
{
  "data": {
    "queryName": {
      // Query results here
    }
  }
}
```

### Error Response
```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [{"line": 2, "column": 3}],
      "path": ["queryName"]
    }
  ],
  "data": null
}
```

## 🔧 **Advanced Usage**

### Complex Query Example
```graphql
query GetHeavenletterWithDetails($nid: ID!) {
  heavenletter(nid: $nid) {
    nid
    title
    number
    body
    teaser
    locale
    language
    author
    created
    changed
    status
  }
}
```

**Variables:**
```json
{
  "nid": "12345"
}
```

### Nested Query Example
```graphql
query {
  heavenletters(limit: 3) {
    nid
    title
    number
    locale
    author
  }
}
```

## ⚡ **Performance Considerations**

### Optimization Tips
1. **Limit Results**: Always use `limit` parameter to avoid large responses
2. **Select Specific Fields**: Only request fields you need
3. **Use Pagination**: Implement `offset` for large datasets
4. **Cache Responses**: Consider caching frequently accessed content

### Query Limits
- **Default Limit**: 10 results per query
- **Maximum Recommended**: 100 results per query
- **Pagination**: Use `offset` for accessing additional results

## 🚨 **Error Handling**

### Common Errors

#### Invalid Node ID
```graphql
query {
  heavenletter(nid: 999999) {
    nid
    title
  }
}
```
**Response**: Returns `null` for non-existent heavenletters

#### Invalid Locale
```graphql
query {
  heavenletters(locale: "invalid") {
    nid
    title
  }
}
```
**Response**: Returns empty array `[]`

#### Missing Required Parameters
```graphql
query {
  heavenletterByNumber(locale: "en") {
    nid
    title
  }
}
```
**Response**: GraphQL validation error for missing `number` parameter

## 🔐 **Authentication**

Currently, the API does not require authentication. All queries are publicly accessible.

## 📝 **Rate Limiting**

No rate limiting is currently implemented. For production deployment, consider implementing appropriate rate limiting based on your usage requirements.

## 🐛 **Known Issues**

### Translation Queries
- **Issue**: `heavenletterTranslations` may return incomplete results
- **Cause**: Legacy database data integrity issues in `localizernode.pid` field
- **Workaround**: Use individual language queries with `locale` parameter

### Database Dependency
- **Requirement**: Active connection to Drupal 5.x database required
- **Fallback**: Mock data returned when database unavailable

## 📞 **Support**

For technical support or questions about the API:
1. Check the GraphiQL interface for interactive query building
2. Review this documentation for query examples
3. Examine the schema definitions in the GraphiQL docs panel

---

**API Version**: 1.0
**Last Updated**: 2025-09-08
**Status**: Production Ready ✅