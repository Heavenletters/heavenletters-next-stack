const mysql = require('mysql2/promise');
const fs = require('fs').promises;

/**
 * Exports all English Heavenletters to JSON format in batches of 100.
 * Handles duplicates and gaps in publish numbers correctly.
 * Includes: Heavenletter Title, Publish Number, Published on date, Heavenletter content.
 */
async function main() {
  console.log('Starting export process for all English heavenletters...');

  let connection;
  const BATCH_SIZE = 100;
  const OUTPUT_DIR = 'heavenletters/json';

  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Connect to the Drupal 5 database
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: '192.168.8.103',
      user: 'root',
      password: 'mojah42',
      database: 'heaven',
      port: 3306
    });
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

    // Process in batches based on actual count
    for (let batchIndex = 0; batchIndex < TOTAL_ENGLISH_HEAVENLETTERS; batchIndex += BATCH_SIZE) {
      const offset = batchIndex;
      const batchStart = batchIndex + 1;
      const batchEnd = Math.min(batchIndex + BATCH_SIZE, TOTAL_ENGLISH_HEAVENLETTERS);
      const filename = `${OUTPUT_DIR}/${batchStart}-${batchEnd}.json`;

      console.log(`Exporting batch: ${batchStart}-${batchEnd} (offset: ${offset})`);

      const [rows] = await connection.execute(`
        SELECT
          nr.title,
          nr.body,
          cth.field_heavenletter__value AS publishNumber,
          cpd.field_published_date_value AS publishedOn
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
        content: row.body
      }));

      await fs.writeFile(filename, JSON.stringify(heavenletters, null, 2));
      console.log(`Successfully wrote ${filename} (${rows.length} records)`);
    }

    console.log(`\nExport completed successfully! Total batches: ${Math.ceil(TOTAL_ENGLISH_HEAVENLETTERS / BATCH_SIZE)}`);

    // Also export a summary file
    const summary = {
      totalEnglishHeavenletters: TOTAL_ENGLISH_HEAVENLETTERS,
      batchSize: BATCH_SIZE,
      totalBatches: Math.ceil(TOTAL_ENGLISH_HEAVENLETTERS / BATCH_SIZE),
      exportTimestamp: new Date().toISOString(),
      note: "Publish numbers have duplicates due to translations. Files named by sequential position, not publish number."
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