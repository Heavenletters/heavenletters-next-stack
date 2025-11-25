const fs = require('fs').promises;
const path = require('path');

/**
 * Convert User Data from JSON to CSV
 *
 * This script reads the user data from the users_by_role_export.json file
 * and converts the username and email fields to CSV format.
 */
async function convertUsersToCsv() {
  try {
    console.log('🔄 Converting user data from JSON to CSV...');

    // Read the JSON file
    const jsonFilePath = path.join(__dirname, 'users_by_role_export.json');
    const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
    const data = JSON.parse(jsonData);

    // Extract the user data
    const users = data.users;

    // Create the CSV header
    const csvHeader = 'username,email\n';

    // Create the CSV rows
    const csvRows = users.map(user => {
      return `${user.username},${user.email}`;
    }).join('\n');

    // Combine the header and rows
    const csvData = csvHeader + csvRows;

    // Write the CSV file
    const csvFilePath = path.join(__dirname, 'users.csv');
    await fs.writeFile(csvFilePath, csvData);

    console.log('✅ Conversion complete!');
    console.log(`📄 CSV data saved to: ${csvFilePath}`);
    console.log(`👥 Total users converted: ${users.length}`);

  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  convertUsersToCsv();
}

module.exports = { convertUsersToCsv };