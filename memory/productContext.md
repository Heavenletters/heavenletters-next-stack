# Product Context: Heavenletters Migration

## User Stories

### As a Spiritual Seeker
- **Reading**: I want to read Heavenletters in my preferred language on a clean, distraction-free interface.
- **Searching**: I want to find specific Heavenletters by searching for keywords or phrases.
- **Navigating**: I want to easily access previous and next letters or browse by date/title/published_number.
- **Sharing**: I want to share inspiring letters with others via social media or email.

### As a Translator
- **Access**: I want to view original English letters alongside their translations.
- **Integrity**: I need assurance that my translations are accurately preserved and displayed.

### As an Administrator
- **Management**: I want a modern dashboard to view and manage content status.
- **Safety**: I need to know that the legacy data remains safe and untouched while I work with the new system.

## Content Models

### Heavenletter (`ks_heavenletter`)
The core content type, representing a Heavenletter.
- **`nid`** (Int): Legacy Node ID from Drupal, used for reference.
- **`title`** (String): The title of the Heavenletter.
- **`body`** (Text): The full content of the letter (MDX supported).
- **`permalink`** (String): Unique, preserved URL path (e.g., `heavenletters/love-is-eternal.html`). Sourced from Drupal `url_alias`.
- **`locale`** (String): Language code (e.g., 'en', 'es', 'fr').
- **`published_on`** (DateTime): Date when the letter was published.
- **`publish_number`** (Int): Sequential number of the letter.
- **`tnid`** (Int): Translation Node ID, linking translations of the same letter.
- **

### User (`ks_user`)
- **`name`** (String): User's display name.
- **`email`** (String): User's email address.
- **`password`** (String): Securely hashed password.
- **`role`** (String): Access level (admin, editor, translator).

## Frontend Relationships
- **Static Generation**: AstroJS generates static pages for each Heavenletter based on the `permalink` field.
- **Data Fetching**: The frontend fetches content from the KeystoneJS GraphQL API during build time.
- **Search Integration**: Client-side search or future LLM-based search queries the backend API.
- **Internationalization**: Locale-based routing ensures users land on the correct language version of the site.