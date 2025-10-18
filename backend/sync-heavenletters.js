console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Attempting to resolve @prisma/client...');

try {
  const prismaPath = require.resolve('@prisma/client');
  console.log('Found @prisma/client at:', prismaPath);
} catch (error) {
  console.log('Failed to resolve @prisma/client:', error.message);
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    mysql: {
      url: 'mysql://root:mojah42@127.0.0.1:3306/heaven',
    },
  },
});

/**
 * Extracts data from legacy Drupal 5.x tables for "heavenletter" content type
 * and upserts it into the ks_heavenletter table.
 */
async function main() {
  console.log('Starting sync process for heavenletters...');

  try {
    // Debug logging: Check what tables and columns are actually available
    console.log('🔍 DEBUG: Checking available tables...');
    const availableTables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Available tables:', availableTables.map(t => Object.values(t)[0]));

    // Debug logging: Check localizernode table structure
    console.log('🔍 DEBUG: Checking localizernode table structure...');
    try {
      const localizernodeStructure = await prisma.$queryRaw`DESCRIBE localizernode`;
      console.log('localizernode columns:', localizernodeStructure.map(col => `${col.Field} (${col.Type})`));
    } catch (error) {
      console.log('❌ ERROR: localizernode table not found or not accessible:', error.message);
    }

    // Debug logging: Check content_type_heavenletters table structure
    console.log('🔍 DEBUG: Checking content_type_heavenletters table structure...');
    try {
      const contentTypeStructure = await prisma.$queryRaw`DESCRIBE content_type_heavenletters`;
      console.log('content_type_heavenletters columns:', contentTypeStructure.map(col => `${col.Field} (${col.Type})`));
    } catch (error) {
      console.log('❌ ERROR: content_type_heavenletters table not found or not accessible:', error.message);
    }

    // Debug logging: Check what content types actually exist
    console.log('🔍 DEBUG: Checking available content types...');
    const contentTypes = await prisma.$queryRaw`SELECT DISTINCT type FROM node WHERE type LIKE '%heaven%'`;
    console.log('Content types matching "heaven":', contentTypes.map(ct => ct.type));

    // Step 1: Extract data from legacy Drupal tables.
    // We are focusing on nodes of type 'heavenletter'.
    console.log('🔍 DEBUG: Attempting original query...');
    const legacyData = await prisma.$queryRaw`
      SELECT
        n.nid,
        n.status,
        n.created,
        n.changed,
        nr.title,
        nr.body,
        ua.dst AS permalink,
        COALESCE(ln.locale, 'en') as locale,
        NULL as tnid
      FROM
        node n
      JOIN
        node_revisions nr ON n.nid = nr.nid
      LEFT JOIN
        url_alias ua ON ua.src = CONCAT('node/', n.nid)
      WHERE
        n.type = 'heavenletter'
      AND n.status = 1
    `;

    console.log(`Found ${legacyData.length} records to process.`);

    let createdCount = 0;
    let updatedCount = 0;

    // Step 2: Iterate over extracted data and perform upsert operations.
    for (const item of legacyData) {
      if (!item.permalink) {
        console.warn(`Skipping nid ${item.nid} due to missing permalink.`);
        continue;
      }

      const permalink = item.permalink.endsWith('.html') ? item.permalink : `${item.permalink}.html`;

      const data = {
        permalink,
        title: item.title,
        body: item.body,
        locale: item.locale || 'en', // Default to 'en' if locale is not set
        publishNumber: item.nid, // Use nid as publishNumber
        publishedOn: new Date(item.created * 1000),
        writtenOn: new Date(item.changed * 1000),
        nid: item.nid,
        tnid: item.tnid,
        tags: [], // Default to empty JSON array
        embeddings: null, // Default to null
        createdAt: new Date(item.created * 1000),
        updatedAt: new Date(item.changed * 1000),
      };

      // Step 3: Upsert data into the ks_heavenletter table.
      const result = await prisma.ks_heavenletter.upsert({
        where: { permalink: data.permalink },
        update: data,
        create: data,
      });

      // The result of an upsert doesn't directly tell us if it was a create or update.
      // A common way to check is to compare createdAt and updatedAt timestamps.
      // If they are very close, it's likely a create operation.
      if (Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000) {
        createdCount++;
      } else {
        updatedCount++;
      }
    }

    console.log('Sync process completed.');
    console.log(`- Records created: ${createdCount}`);
    console.log(`- Records updated: ${updatedCount}`);

  } catch (error) {
    console.error('An error occurred during the sync process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();