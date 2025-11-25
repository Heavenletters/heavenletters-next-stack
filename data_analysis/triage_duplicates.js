const mysql = require('mysql2/promise');
const fs = require('fs').promises;

// --- Configuration ---
const DB_CONFIG = {
  host: '192.168.8.103',
  user: 'root',
  password: 'mojah42',
  database: 'heaven',
  port: 3306
};

const OUTPUT_MD_FILE = 'duplicates_analysis_report.md';
const OUTPUT_SQL_FILE = 'proposed_fixes.sql';

// --- Main Function ---
async function triageDuplicatePublishNumbers() {
  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('Connected to database.');

    // 1. Get the list of duplicate sets (publishNumber, locale)
    const duplicateSets = await getDuplicateSets(connection);
    console.log(`Found ${duplicateSets.length} sets of duplicates to analyze.`);

    let markdownOutput = `# Duplicate Publish Numbers Analysis Report\n\nGenerated: ${new Date().toISOString()}\n\n`;
    let sqlOutput = `-- Proposed Fixes for Duplicate Heavenletters\n-- Generated: ${new Date().toISOString()}\n-- Review each statement carefully and uncomment to execute.\n\n`;

    // 2. Process each duplicate set
    for (const [index, set] of duplicateSets.entries()) {
      console.log(`Analyzing set ${index + 1}/${duplicateSets.length}: Publish Number ${set.publishNumber}, Locale ${set.locale}`);

      const { report, sql } = await analyzeAndProposeFix(connection, set.publishNumber, set.locale);

      markdownOutput += report;
      sqlOutput += sql;
    }

    // 3. Write output files
    await fs.writeFile(OUTPUT_MD_FILE, markdownOutput);
    console.log(`\nAnalysis report saved to: ${OUTPUT_MD_FILE}`);

    await fs.writeFile(OUTPUT_SQL_FILE, sqlOutput);
    console.log(`Proposed SQL fixes saved to: ${OUTPUT_SQL_FILE}`);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// --- Helper Functions ---

async function getDuplicateSets(connection) {
  const [rows] = await connection.execute(`
    SELECT
      cth.field_heavenletter__value AS publishNumber,
      ln.locale
    FROM node n
    JOIN localizernode ln ON n.nid = ln.nid
    JOIN content_type_heavenletters cth ON n.vid = cth.vid
    WHERE n.type = 'heavenletters' AND n.status = 1 AND cth.field_heavenletter__value IS NOT NULL
    GROUP BY cth.field_heavenletter__value, ln.locale
    HAVING COUNT(*) > 1
    ORDER BY cth.field_heavenletter__value, ln.locale
  `);
  return rows;
}

async function analyzeAndProposeFix(connection, publishNumber, locale) {
  // Get rich details for each node in the duplicate set
  const [nodes] = await connection.execute(`
    SELECT
      n.nid,
      n.vid,
      n.title,
      n.created,
      n.changed,
      nr.body
    FROM node n
    JOIN node_revisions nr ON n.vid = nr.vid
    LEFT JOIN localizernode ln ON n.nid = ln.nid
    JOIN content_type_heavenletters cth ON n.vid = cth.vid
    WHERE cth.field_heavenletter__value = ? AND ln.locale = ? AND n.type = 'heavenletters'
    ORDER BY n.nid ASC
  `, [publishNumber, locale]);

  // --- Analysis Logic ---
  let primaryNode = null;
  const duplicatesToDelete = [];
  const nodesToUpdate = [];
  let analysisReasoning = [];

  // Heuristic 1: Identify "Working Copies" based on title
  const workingCopyRegex = /^\s*\([a-z]{2}\)/i; // e.g., "(it) Some Title"
  const validNodes = [];
  for (const node of nodes) {
    if (workingCopyRegex.test(node.title)) {
      duplicatesToDelete.push(node);
      analysisReasoning.push(`- Node ${node.nid} ('${node.title}') was identified as a working copy and marked for deletion.`);
    } else {
      validNodes.push(node);
    }
  }

  // Heuristic 2: From remaining nodes, find the best "primary" node
  if (validNodes.length > 0) {
    // The best candidate is often the one with the lowest NID (oldest) or longest body.
    // Let's sort by NID ascending to keep the first one created.
    validNodes.sort((a, b) => a.nid - b.nid);
    primaryNode = validNodes;
    analysisReasoning.push(`- Node ${primaryNode.nid} ('${primaryNode.title}') was chosen as the primary node (oldest NID).`);

    if (validNodes.length > 1) {
      const otherNodes = validNodes.slice(1);
      duplicatesToDelete.push(...otherNodes);
      for (const node of otherNodes) {
        analysisReasoning.push(`- Node ${node.nid} ('${node.title}') is a duplicate of the primary and marked for deletion.`);
      }
    }
  } else if (nodes.length > 0) {
    // This can happen if all nodes were considered working copies. Keep the oldest one.
    nodes.sort((a, b) => a.nid - b.nid);
    primaryNode = nodes;
    duplicatesToDelete.splice(duplicatesToDelete.indexOf(primaryNode), 1); // Don't delete the primary
    analysisReasoning.push(`- All nodes looked like working copies. Node ${primaryNode.nid} was kept as primary (oldest NID).`);
  }

  // Heuristic 3: Check for orphaned translations (simple check)
  if (primaryNode && locale !== 'eng') {
      analysisReasoning.push(`- **Warning**: Primary node ${primaryNode.nid} may be an orphaned translation. Manual review needed to link it to the English source.`);
  }

  // --- Generate Report and SQL ---
  let report = `## Publish Number: ${publishNumber} | Locale: ${locale}\n\n`;
  report += `Found ${nodes.length} nodes:\n\n`;
  report += '| NID | VID | Title | Created | Changed | Body Length |\n';
  report += '|---|---|---|---|---|---|\n';
  nodes.forEach(n => {
    report += `| ${n.nid} | ${n.vid} | ${n.title} | ${new Date(n.created * 1000).toISOString()} | ${new Date(n.changed * 1000).toISOString()} | ${n.body.length} |\n`;
  });
  report += `\n**Analysis & Proposed Action:**\n\n`;
  report += analysisReasoning.join('\n') + '\n\n';

  let sql = `-- Fix for Publish Number: ${publishNumber}, Locale: ${locale}\n`;
  if (duplicatesToDelete.length > 0) {
    sql += `-- Action: Delete ${duplicatesToDelete.length} duplicate node(s).\n`;
    duplicatesToDelete.forEach(node => {
      sql += `-- DELETE FROM node WHERE nid = ${node.nid}; -- Title: ${node.title}\n`;
    });
  } else {
    sql += `-- No automatic action proposed. Requires manual review.\n`;
  }
  sql += '\n';

  return { report, sql };
}

// --- Run Script ---
triageDuplicatePublishNumbers();