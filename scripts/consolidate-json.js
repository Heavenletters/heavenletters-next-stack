const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../heavenletters/json');
const outputFile = path.join(__dirname, '../heavenletters/heavenletters.json');
const consolidatedData = {};

console.log('Starting consolidation...');

const filesToProcess = ['1-100.json', '101-200.json', '201-300.json'];

filesToProcess.forEach(file => {
    const filePath = path.join(inputDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${file}...`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        data.forEach(item => {
            if (item.publishNumber <= 300) {
                consolidatedData[item.publishNumber] = {
                    title: item.title,
                    publishedOn: item.publishedOn,
                    body: item.body || '',
                };
            }
        });
    } else {
        console.log(`File not found: ${file}`);
    }
});

fs.writeFileSync(outputFile, JSON.stringify(consolidatedData, null, 2));

const totalConsolidated = Object.keys(consolidatedData).length;
console.log(`\nConsolidation complete!`);
console.log(`Total Heavenletters consolidated: ${totalConsolidated}`);
console.log(`Output file created at: ${outputFile}`);
