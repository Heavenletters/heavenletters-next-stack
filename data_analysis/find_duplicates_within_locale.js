const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function findDuplicatePublishNumbersWithinLocale() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '192.168.8.103',
      user: 'root',
      password: 'mojah42',
      database: 'heaven',
      port: 3306
    });

    console.log('Connected to database');

    // Find all duplicate publish numbers within the same locale
    const [duplicates] = await connection.execute(`
      SELECT
        cth.field_heavenletter__value as publishNumber,
        COALESCE(ln.locale, 'null') as locale,
        COUNT(*) as duplicate_count,
        GROUP_CONCAT(
          CONCAT(
            'NID:', n.nid,
            ' | Title:', LEFT(n.title, 60),
            ' | Status:', n.status
          )
          ORDER BY n.nid SEPARATOR '\n---\n'
        ) as node_details
      FROM node n
      LEFT JOIN localizernode ln ON n.nid = ln.nid
      INNER JOIN (SELECT nid, MAX(vid) AS max_vid FROM node_revisions GROUP BY nid) AS max_rev ON n.nid = max_rev.nid
      INNER JOIN node_revisions nr ON max_rev.max_vid = nr.vid
      LEFT JOIN content_type_heavenletters cth ON nr.vid = cth.vid
      WHERE n.type = 'heavenletters'
        AND n.status = 1
        AND cth.field_heavenletter__value IS NOT NULL
      GROUP BY cth.field_heavenletter__value, ln.locale
      HAVING COUNT(*) > 1
      ORDER BY cth.field_heavenletter__value ASC, ln.locale ASC
    `);

    console.log('\n=== DUPLICATE PUBLISH NUMBERS WITHIN SAME LOCALE ===');
    console.log('Total duplicate sets found:', duplicates.length);
    console.log('');

    // Prepare output for file
    let output = '# Duplicate Publish Numbers Report (Within Same Locale)\n';
    output += 'Generated: ' + new Date().toISOString() + '\n\n';
    output += 'Total duplicate sets found: ' + duplicates.length + '\n\n';

    // Display all duplicates and write to file
    duplicates.forEach((dup, index) => {
      const duplicateHeader = `## Duplicate #${index + 1}: Publish Number ${dup.publishNumber} in Locale '${dup.locale}' (appears ${dup.duplicate_count} times)\n`;
      console.log(`--- Duplicate #${index + 1}: Publish Number ${dup.publishNumber} in Locale '${dup.locale}' (appears ${dup.duplicate_count} times) ---`);
      console.log(dup.node_details);
      console.log('');

      output += duplicateHeader;
      output += dup.node_details.replace(/\n/g, '\n\n') + '\n\n';
    });

    // Write to file
    await fs.writeFile('duplicate_publish_within_locale_report.md', output);
    console.log('Report saved to: duplicate_publish_within_locale_report.md');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

findDuplicatePublishNumbersWithinLocale();