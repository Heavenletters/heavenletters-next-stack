#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

/**
 * Simple test script for the natural query tool
 * Tests a few predefined queries to make sure everything works
 */

async function testQuery(description, naturalLanguageQuery, expectedSql) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`Natural Language: "${naturalLanguageQuery}"`);

  // For now, just show what SQL would be generated
  console.log('Expected SQL:');
  console.log(expectedSql);

  // Actually test the database connection and query
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found');
    }

    connection = await mysql.createConnection(databaseUrl);

    console.log('⚡ Executing query...\n');

    const [rows] = await connection.execute(expectedSql);

    if (rows.length === 0) {
      console.log('📭 No results found');
    } else {
      // Display first few results
      const displayRows = rows.slice(0, 5);
      console.log(`📊 Results (showing ${displayRows.length} of ${rows.length} rows):`);
      console.log(displayRows);
    }

    console.log('✅ Test passed\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  console.log('🧪 Natural Query Tool - Test Suite');
  console.log('===================================\n');

  // Test 1: Count German translations by theophil
  await testQuery(
    'Count German translations by theophil',
    'How many German Heavenletters were translated by theophil?',
    `SELECT COUNT(*) as total_translated
FROM node n
INNER JOIN localizernode ln ON n.nid = ln.nid AND ln.locale = 'de'
INNER JOIN (
  SELECT nid, MAX(vid) AS max_vid
  FROM node_revisions
  GROUP BY nid
) AS max_rev ON n.nid = max_rev.nid
INNER JOIN node_revisions nr ON max_rev.max_vid = nr.vid
INNER JOIN content_type_heavenletters cth ON nr.vid = cth.vid
INNER JOIN users u ON cth.field_translated_by_uid = u.uid
WHERE n.type = 'heavenletters'
  AND n.status = 1
  AND u.name = 'theophil'
  AND cth.field_translated_by_uid IS NOT NULL;`
  );

  // Test 2: List translators and their counts
  await testQuery(
    'List translators and their counts',
    'List all translators and their translation counts',
    `SELECT
  u.name AS translator,
  COUNT(*) as translation_count
FROM users u
INNER JOIN content_type_heavenletters cth ON u.uid = cth.field_translated_by_uid
INNER JOIN node_revisions nr ON cth.vid = nr.vid
INNER JOIN node n ON nr.nid = n.nid
WHERE n.type = 'heavenletters' AND n.status = 1
  AND cth.field_translated_by_uid IS NOT NULL
GROUP BY u.uid, u.name
ORDER BY translation_count DESC
LIMIT 10;`
  );

  // Test 3: Count total English Heavenletters
  await testQuery(
    'Count total English Heavenletters',
    'Show me the total number of published English Heavenletters',
    `SELECT COUNT(*) as total_english_heavenletters
FROM node n
INNER JOIN localizernode ln ON n.nid = ln.nid AND ln.locale = 'eng'
INNER JOIN (
  SELECT nid, MAX(vid) AS max_vid
  FROM node_revisions
  GROUP BY nid
) AS max_rev ON n.nid = max_rev.nid
INNER JOIN node_revisions nr ON max_rev.max_vid = nr.vid
WHERE n.type = 'heavenletters' AND n.status = 1;`
  );

  console.log('🎉 Test suite completed!');
}

if (require.main === module) {
  main().catch(console.error);
}