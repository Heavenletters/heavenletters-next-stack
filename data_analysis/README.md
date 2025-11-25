# Data Analysis Scripts

This directory contains scripts for analyzing and migrating the Drupal 5 database.

## Installation

To get started, navigate to this directory and install the necessary dependencies:

```bash
cd data_analysis
npm install
```

## Usage

The following scripts are available and can be run using `npm run <script_name>`:

-   **`analyze-db`**: Analyzes the database structure.
-   **`export-heavenletters`**: Exports Heavenletters data.
-   **`natural-query`**: Executes a natural language query against the database.
-   **`find-duplicates`**: Finds duplicate entries within a locale.
-   **`triage-duplicates`**: Helps in triaging duplicate entries.

For example, to run the database analysis script:

```bash
npm run analyze-db