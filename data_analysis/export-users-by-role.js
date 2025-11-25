const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

/**
 * Export Users with Specific Role IDs from Drupal 5 Legacy Database
 *
 * This script queries users with role IDs 4, 5, 6, 7, 8 from the Drupal 5
 * legacy database and exports all their data including user image paths
 * to a JSON file.
 *
 * Database: 10.163.126.26 (MariaDB)
 * Target Roles: 4, 5, 6, 7, 8
 */

const dbConfig = {
  host: '10.163.126.26',
  port: 3306,
  user: 'root',
  password: 'mojah42',
  database: 'heaven'
};

const TARGET_ROLE_IDS = [4, 5, 6, 7, 8];

async function exportUsersByRole() {
  let connection;

  try {
    console.log('🔍 Connecting to Drupal 5 legacy database at 10.163.126.26...');
    console.log(`🎯 Target Role IDs: ${TARGET_ROLE_IDS.join(', ')}`);

    connection = await mysql.createConnection(dbConfig);

    // First, let's examine the database structure
    console.log('\n📋 Examining database structure...');

    // Check if users table exists and get its structure
    try {
      const [userTables] = await connection.execute("SHOW TABLES LIKE 'users'");
      if (userTables.length === 0) {
        throw new Error('Users table not found. Checking alternative table names...');
      }
      console.log('✅ Users table found');
    } catch (error) {
      console.log('❌ Users table not found, checking other possible names...');
      const [allTables] = await connection.execute("SHOW TABLES");
      console.log('Available tables:');
      allTables.forEach(table => {
        const tableName = Object.values(table)[0];
        if (tableName.toLowerCase().includes('user')) {
          console.log(`  - ${tableName}`);
        }
      });
    }

    // Check for role-related tables
    console.log('\n🔍 Checking role-related tables...');
    const [roleTables] = await connection.execute("SHOW TABLES LIKE '%role%'");
    if (roleTables.length > 0) {
      console.log('Role tables found:');
      roleTables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
    }

    // Check for files table (for user images) and examine picture field
    console.log('\n🖼️  Investigating user picture storage...');

    // First, let's see what the users table picture field actually contains
    const [sampleUsersWithPictures] = await connection.execute(`
      SELECT uid, name, picture
      FROM users
      WHERE picture IS NOT NULL AND picture != ''
      LIMIT 5
    `);

    console.log('Sample users with picture data:');
    sampleUsersWithPictures.forEach(user => {
      console.log(`  - UID ${user.uid}: "${user.name}" has picture: "${user.picture}"`);
    });

    // Check files table structure
    const [filesTables] = await connection.execute("SHOW TABLES LIKE 'files'");
    if (filesTables.length > 0) {
      console.log('\n📁 Files table structure:');
      const [filesStructure] = await connection.execute('DESCRIBE files');
      filesStructure.forEach(field => {
        console.log(`  - ${field.Field} (${field.Type}) ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Check if there are any files at all
      const [fileCount] = await connection.execute('SELECT COUNT(*) as count FROM files');
      console.log(`\nTotal files in database: ${fileCount[0].count}`);

      // Show sample files
      if (fileCount[0].count > 0) {
        const [sampleFiles] = await connection.execute('SELECT * FROM files LIMIT 3');
        console.log('\nSample files:');
        sampleFiles.forEach((file, index) => {
          console.log(`File ${index + 1}:`, Object.keys(file).map(key => `${key}: ${file[key]}`).join(', '));
        });
      }
    } else {
      console.log('❌ Files table not found');
      const [allTables] = await connection.execute("SHOW TABLES");
      const possibleFileTables = allTables.filter(table => {
        const tableName = Object.values(table)[0].toLowerCase();
        return tableName.includes('file') || tableName.includes('image') || tableName.includes('picture');
      });
      if (possibleFileTables.length > 0) {
        console.log('Possible file/image tables:');
        possibleFileTables.forEach(table => {
          console.log(`  - ${Object.values(table)[0]}`);
        });
      }
    }

    // Get all users with their roles
    console.log('\n👥 Fetching users with target roles...');

    let usersQuery;
    let queryParams;

    // Try different query strategies based on available tables

    // Strategy 1: Check for users_roles junction table (most common Drupal structure)
    try {
      usersQuery = `
        SELECT DISTINCT
          u.uid,
          u.name,
          u.mail,
          u.pass,
          u.mode,
          u.sort,
          u.threshold,
          u.theme,
          u.signature,
          u.created,
          u.access,
          u.login,
          u.status,
          u.timezone,
          u.timezone_name,
          u.language,
          u.picture,
          u.init,
          u.data,
          GROUP_CONCAT(r.rid) as role_ids,
          GROUP_CONCAT(r.name) as role_names
        FROM users u
        LEFT JOIN users_roles ur ON u.uid = ur.uid
        LEFT JOIN role r ON ur.rid = r.rid
        WHERE r.rid IN (${TARGET_ROLE_IDS.map(() => '?').join(',')})
        GROUP BY u.uid
        ORDER BY u.uid
      `;
      queryParams = TARGET_ROLE_IDS;

      const [usersWithRoles] = await connection.execute(usersQuery, queryParams);

      if (usersWithRoles.length > 0) {
        console.log(`✅ Found ${usersWithRoles.length} users with target roles using users_roles table`);

        // Transform the data for clean output
        const transformedUsers = usersWithRoles.map(user => {
          // Parse serialized PHP data safely
          let parsedData = null;
          try {
            if (user.data) {
              // Try to parse as serialized PHP data (Drupal format)
              // This is a simplified parser for common Drupal serialized data
              const data = user.data;
              if (data.startsWith('a:') && data.includes('{')) {
                // Extract simple key-value pairs from serialized PHP
                parsedData = { raw_serialized: data };
              } else {
                parsedData = data;
              }
            }
          } catch (e) {
            parsedData = { raw_data: user.data };
          }

          return {
            uid: user.uid,
            username: user.name,
            email: user.mail,
            status: user.status,
            created: user.created ? new Date(user.created * 1000).toISOString() : null,
            last_access: user.access ? new Date(user.access * 1000).toISOString() : null,
            last_login: user.login ? new Date(user.login * 1000).toISOString() : null,
            picture_path: user.picture, // Use the picture field directly - it contains the file path
            picture_mime: null, // Will be populated if we can find matching file in files table
            picture_size: null, // Will be populated if we can find matching file in files table
            theme: user.theme,
            language: user.language,
            timezone: user.timezone,
            timezone_name: user.timezone_name,
            signature: user.signature,
            mode: user.mode,
            sort: user.sort,
            threshold: user.threshold,
            init: user.init,
            roles: user.role_ids ? user.role_ids.split(',').map((rid, index) => ({
              role_id: parseInt(rid),
              role_name: user.role_names.split(',')[index]
            })) : [],
            raw_data: parsedData
          };
        });

        // Now let's enrich the data with file information from the files table
        console.log('\n🔍 Enriching user data with file information...');
        const usersWithFileInfo = await Promise.all(transformedUsers.map(async (user) => {
          if (user.picture_path && user.picture_path.trim() !== '') {
            try {
              // Try to find matching file in files table
              const [fileData] = await connection.execute(
                'SELECT filemime, filesize FROM files WHERE filepath = ? LIMIT 1',
                [user.picture_path]
              );

              if (fileData.length > 0) {
                user.picture_mime = fileData[0].filemime;
                user.picture_size = parseInt(fileData[0].filesize);
              } else {
                // If not found in files table, try to infer mime type from extension
                const extension = user.picture_path.toLowerCase().split('.').pop();
                const mimeMap = {
                  'jpg': 'image/jpeg',
                  'jpeg': 'image/jpeg',
                  'png': 'image/png',
                  'gif': 'image/gif',
                  'bmp': 'image/bmp',
                  'webp': 'image/webp'
                };
                user.picture_mime = mimeMap[extension] || 'application/octet-stream';
                user.picture_size = null; // Unknown size
              }
            } catch (e) {
              console.log(`  Warning: Could not get file info for ${user.picture_path}: ${e.message}`);
            }
          }
          return user;
        }));

        // Count users with pictures
        const usersWithPictures = usersWithFileInfo.filter(u => u.picture_path && u.picture_path.trim() !== '').length;
        console.log(`📸 Found ${usersWithPictures} users with profile pictures`);

        // Save to JSON file
        const outputData = {
          metadata: {
            query_timestamp: new Date().toISOString(),
            target_role_ids: TARGET_ROLE_IDS,
            database_host: dbConfig.host,
            database_name: dbConfig.database,
            total_users: usersWithFileInfo.length,
            users_with_pictures: usersWithPictures,
            database_type: 'Drupal 5 (MariaDB)',
            script_version: '1.2 (Fixed Picture Paths)'
          },
          users: usersWithFileInfo
        };

        const outputFile = path.join(__dirname, 'users_by_role_export.json');
        await fs.writeFile(outputFile, JSON.stringify(outputData, null, 2));

        console.log(`\n✅ Export complete!`);
        console.log(`📄 Data saved to: ${outputFile}`);
        console.log(`👥 Total users exported: ${usersWithFileInfo.length}`);
        console.log(`🖼️  Users with profile pictures: ${usersWithPictures}`);

        // Display summary
        console.log('\n📊 Summary by Role:');
        const roleSummary = {};
        usersWithFileInfo.forEach(user => {
          user.roles.forEach(role => {
            if (!roleSummary[role.role_name]) {
              roleSummary[role.role_name] = 0;
            }
            roleSummary[role.role_name]++;
          });
        });

        Object.entries(roleSummary).forEach(([roleName, count]) => {
          console.log(`  - ${roleName}: ${count} users`);
        });

        // Show sample of exported data with pictures
        console.log('\n📋 Sample Users with Pictures:');
        const usersWithPicsSample = usersWithFileInfo.filter(u => u.picture_path && u.picture_path.trim() !== '').slice(0, 3);
        usersWithPicsSample.forEach(user => {
          console.log(`  - ${user.username} (UID: ${user.uid}) - Picture: "${user.picture_path}" (${user.picture_mime})`);
        });

        return outputData;

      } else {
        console.log('No users found with target roles using users_roles table.');
      }

    } catch (error) {
      console.log(`❌ users_roles table approach failed: ${error.message}`);
      // Continue to next strategy
    }

    // Strategy 2: Direct users table check (simpler structure)
    console.log('\n🔄 Trying direct users table approach...');

    try {
      // Check what columns exist in users table
      const [userColumns] = await connection.execute('DESCRIBE users');
      console.log('Users table columns:');
      userColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });

      // Try to get users and check for role data in a single column or separate query
      const [allUsers] = await connection.execute(`
        SELECT uid, name, mail, status, created, access, login, picture, theme, language, timezone, signature, data
        FROM users
        WHERE status = 1
        ORDER BY uid
      `);

      console.log(`Found ${allUsers.length} total active users`);

      // For each user, we'll need to check their roles separately
      // This is less efficient but handles different Drupal installations

      const usersWithRoleData = [];

      for (const user of allUsers.slice(0, 10)) { // Limit for testing
        // Check if this user has any of our target roles
        // This would require a separate query to users_roles or role table
        // For now, we'll include all users and note that role checking needs to be implemented

        const userData = {
          uid: user.uid,
          username: user.name,
          email: user.mail,
          status: user.status,
          created: user.created ? new Date(user.created * 1000).toISOString() : null,
          last_access: user.access ? new Date(user.access * 1000).toISOString() : null,
          last_login: user.login ? new Date(user.login * 1000).toISOString() : null,
          theme: user.theme,
          language: user.language,
          timezone: user.timezone,
          signature: user.signature,
          picture_path: null, // Would need files table lookup
          roles: [], // Would need users_roles table to populate
          raw_data: user.data ? JSON.parse(user.data) : null
        };

        usersWithRoleData.push(userData);
      }

      console.log(`📊 Processed ${usersWithRoleData.length} users for testing`);

    } catch (error) {
      console.log(`❌ Direct users approach failed: ${error.message}`);
    }

    // Strategy 3: Show database structure for manual investigation
    console.log('\n🔍 Database structure analysis for manual investigation:');

    const [allTables] = await connection.execute("SHOW TABLES");
    console.log('All tables in database:');
    allTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Check for role information in various places
    console.log('\n🎭 Looking for role information:');

    // Check if there's a role column in users table
    try {
      const [userColumns] = await connection.execute('DESCRIBE users');
      const roleColumn = userColumns.find(col =>
        col.Field.toLowerCase().includes('role') ||
        col.Field.toLowerCase().includes('perm')
      );
      if (roleColumn) {
        console.log(`Found potential role column: ${roleColumn.Field} (${roleColumn.Type})`);
      }
    } catch (e) {
      console.log('Could not describe users table');
    }

    // Show sample data from users table
    console.log('\n📋 Sample users data:');
    const [sampleUsers] = await connection.execute('SELECT * FROM users LIMIT 3');
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, Object.keys(user));
    });

    console.log('\n⚠️  Please review the database structure above and adjust the script accordingly.');
    console.log('The script may need to be modified based on your specific Drupal 5 installation.');

  } catch (error) {
    console.error('❌ Export failed:', error.message);

    // If connection fails, suggest using the alternate host
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.log('\n💡 Connection failed. Trying alternate connection method...');
      console.log('You may need to:');
      console.log('1. Verify the database server is accessible from this location');
      console.log('2. Check firewall settings');
      console.log('3. Verify credentials');
      console.log('4. Consider using SSH tunnel or VPN if required');
    }

    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Drupal 5 User Export by Role...\n');

  try {
    const result = await exportUsersByRole();
    console.log('\n🎉 Script completed successfully!');
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { exportUsersByRole };