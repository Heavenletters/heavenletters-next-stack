/**
 * HEAVENLETTERS EXPORT SCRIPT
 * ===========================
 *
 * This script exports English Heavenletters from a Drupal 5 database to JSON format.
 * It processes data in batches to handle large datasets efficiently and includes
 * permalink extraction for complete data migration.
 *
 * USAGE
 * -----
 *
 * Basic usage (export all heavenletters):
 *   node export-heavenletters.js
 *
 * Export specific number of batches:
 *   node export-heavenletters.js 5          # Export first 5 batches (500 records)
 *   node export-heavenletters.js 10         # Export first 10 batches (1000 records)
 *   node export-heavenletters.js 1          # Export first batch only (100 records)
 *
 * HELP
 * ----
 *   node export-heavenletters.js --help     # Show usage information
 *
 * REQUIREMENTS
 * ------------
 *
 * 1. Environment Configuration:
 *    - Ensure scripts/.env file exists with DATABASE_URL
 *    - Copy from backend/.env for database credentials
 *    - Database must be accessible from current environment
 *
 * 2. Database Requirements:
 *    - Drupal 5.x MySQL database with heavenletters content
 *    - Required tables: node, node_revisions, localizernode, content_type_heavenletters,
 *      content_field_published_date, url_alias
 *    - English localization data (locale = 'eng')
 *
 * 3. File Output:
 *    - Creates heavenletters/json/ directory if it doesn't exist
 *    - Generates batch files: batch-{number}-{start}-{end}.json
 *    - Creates export-summary.json with metadata
 *
 * OUTPUT FORMAT
 * -------------
 *
 * Each JSON record contains:
 *   {
 *     "title": "Heavenletter Title",
 *     "publishNumber": "123",
 *     "publishedOn": "2023-01-15 00:00:00",
 *     "permalink": "/heavenletters/123-my-heavenletter",
 *     "content": "Full heavenletter content..."
 *   }
 *
 * PERFORMANCE NOTES
 * -----------------
 *
 * - Batch size: 100 records per batch (configurable via EXPORT_BATCH_SIZE)
 * - Memory efficient for large datasets (64,500+ records)
 * - Handles database connection pooling automatically
 * - Includes error handling and progress reporting
 *
 * TROUBLESHOOTING
 * ---------------
 *
 * If script fails:
 * 1. Check DATABASE_URL in scripts/.env
 * 2. Verify database connectivity
 * 3. Ensure sufficient disk space for output
 * 4. Check file permissions for output directory
 *
 * SECURITY NOTES
 * --------------
 *
 * - Database credentials stored in .env file
 * - Ensure .env file is not committed to version control
 * - Use environment-specific database connections
 *
 * @author Heavenletters Development Team
 * @version 2.0.0
 * @date 2025-11-14
 */

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

/**
 * Parses a database URL string into connection options
 * @param {string} databaseUrl - The database URL in format: mysql://user:password@host:port/database
 * @returns {object} - Connection options for mysql2
 */
function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    port: parseInt(url.port) || 3306
  };
}

/**
 * Shows help information
 */
function showHelp() {
  console.log(`
Heavenletters Export Script
===========================

USAGE:
  node export-heavenletters.js [options]

OPTIONS:
  <number>           Number of batches to export (default: all)
  --help, -h         Show this help message
  --version, -v      Show script version

EXAMPLES:
  node export-heavenletters.js           # Export all heavenletters
  node export-heavenletters.js 5         # Export first 5 batches (500 records)
  node export-heavenletters.js --help    # Show this help

For more information, see the script header documentation.
`);
}

/**
 * Exports English Heavenletters to JSON format in batches.
 * Handles duplicates and gaps in publish numbers correctly.
 * Includes: Heavenletter Title, Publish Number, Published on date, Heavenletter content, and Permalink.
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Check for version flag
  if (args.includes('--version') || args.includes('-v')) {
    console.log('Heavenletters Export Script v2.0.0');
    process.exit(0);
  }

  const requestedBatches = args.length > 0 ? parseInt(args[0]) : null;

  console.log('Starting export process for English heavenletters...');
  if (requestedBatches) {
    console.log(`Limited to ${requestedBatches} batch(es) by user request`);
  }

  let connection;
  const BATCH_SIZE = 100;
  const OUTPUT_DIR = 'heavenletters/json';

  // Get database connection from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const dbConfig = parseDatabaseUrl(databaseUrl);
  console.log(`Connecting to database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Connect to the Drupal 5 database
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully.');

    // Get actual count of English heavenletters
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM node n
      INNER JOIN localizernode ln ON n.nid = ln.nid AND ln.locale = 'eng'
      INNER JOIN (SELECT nid, MAX(vid) AS max_vid FROM node_revisions GROUP BY nid) AS max_rev ON n.nid = max_rev.nid
      INNER JOIN node_revisions nr ON max_rev.max_vid = nr.vid
      WHERE n.type = 'heavenletters' AND n.status = 1
    `);

    const TOTAL_ENGLISH_HEAVENLETTERS = countResult[0].total;
    console.log(`Found ${TOTAL_ENGLISH_HEAVENLETTERS} published English heavenletters`);

    // Determine how many batches to process
    const totalBatches = Math.ceil(TOTAL_ENGLISH_HEAVENLETTERS / BATCH_SIZE);
    const batchesToProcess = requestedBatches ? Math.min(requestedBatches, totalBatches) : totalBatches;

    if (requestedBatches && requestedBatches > totalBatches) {
      console.log(`Requested ${requestedBatches} batches, but only ${totalBatches} available. Processing all ${totalBatches} batches.`);
    }

    console.log(`Processing ${batchesToProcess} batch(es) of ${BATCH_SIZE} records each`);

    // Process in batches
    for (let batchIndex = 0; batchIndex < (batchesToProcess * BATCH_SIZE); batchIndex += BATCH_SIZE) {
      const offset = batchIndex;
      const batchNumber = Math.floor(batchIndex / BATCH_SIZE) + 1;
      const batchStart = batchIndex + 1;
      const batchEnd = Math.min(batchIndex + BATCH_SIZE, TOTAL_ENGLISH_HEAVENLETTERS);
      const filename = `${OUTPUT_DIR}/batch-${batchNumber}-${batchStart}-${batchEnd}.json`;

      console.log(`Exporting batch ${batchNumber}: ${batchStart}-${batchEnd} (offset: ${offset})`);

      const [rows] = await connection.execute(`
        SELECT
          nr.title,
          nr.body,
          cth.field_heavenletter__value AS publishNumber,
          cpd.field_published_date_value AS publishedOn,
          ua.dst AS permalink,
          n.nid
        FROM
          node n
        INNER JOIN
          localizernode ln ON n.nid = ln.nid AND ln.locale = 'eng'
        INNER JOIN
          (SELECT nid, MAX(vid) AS max_vid FROM node_revisions GROUP BY nid) AS max_rev ON n.nid = max_rev.nid
        INNER JOIN
          node_revisions nr ON max_rev.max_vid = nr.vid
        LEFT JOIN
          content_type_heavenletters cth ON nr.vid = cth.vid
        LEFT JOIN
          content_field_published_date cpd ON nr.vid = cpd.vid
        LEFT JOIN
          url_alias ua ON ua.src = CONCAT('node/', n.nid)
        WHERE
          n.type = 'heavenletters' AND n.status = 1
        ORDER BY
          COALESCE(cth.field_heavenletter__value, n.nid) ASC
        LIMIT ?
        OFFSET ?
      `, [BATCH_SIZE, offset]);

      const heavenletters = rows.map(row => ({
        title: row.title,
        publishNumber: row.publishNumber,
        publishedOn: row.publishedOn,
        permalink: row.permalink || `/node/${row.nid}`, // Fallback to standard Drupal path
        content: row.body
      }));

      await fs.writeFile(filename, JSON.stringify(heavenletters, null, 2));
      console.log(`Successfully wrote ${filename} (${rows.length} records)`);
    }

    console.log(`\nExport completed successfully! Processed ${batchesToProcess} batch(es) out of ${totalBatches} total`);

    // Also export a summary file
    const summary = {
      totalEnglishHeavenletters: TOTAL_ENGLISH_HEAVENLETTERS,
      batchSize: BATCH_SIZE,
      totalBatches: totalBatches,
      batchesProcessed: batchesToProcess,
      exportTimestamp: new Date().toISOString(),
      batchLimitRequested: requestedBatches,
      note: "Publish numbers have duplicates due to translations. Files named by batch number and sequential position, not publish number. Permalink extracted from url_alias table."
    };

    await fs.writeFile(`${OUTPUT_DIR}/export-summary.json`, JSON.stringify(summary, null, 2));
    console.log('Export summary written to export-summary.json');

  } catch (error) {
    console.error('An error occurred during the export process:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

main();