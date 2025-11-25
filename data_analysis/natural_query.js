#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const readline = require('readline');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
/**
 * Natural Language Query Tool for Heavenletters Database
 *
 * This tool allows users to query the Heavenletters database using natural language.
 * An AI agent translates the natural language into SQL based on the schema documentation.
 *
 * Usage: node natural_query.js
 *
 * The tool will prompt for natural language queries and display results.
 * Type 'quit' or 'exit' to end the session.
 */

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

class NaturalQueryTool {
  constructor() {
    this.connection = null;
    this.readmePath = path.join(__dirname, 'natural_query_schema.md');
    this.schemaContent = null;
    this.genAI = null;
    this.model = null;
    this.totalTokens = 0;
    this.totalCost = 0;
    this.history = [];
    this.tokenCostMap = {
      'gemini-flash-latest': 0.000001, // Example cost, adjust if necessary
      'gemini-pro': 0.000002,          // Example cost
      // Add other models as needed
    };
    this.queriesPath = path.join(__dirname, 'queries.json');
    this.savedQueries = {};
  }

  async initialize(selectedModel = null) {
    console.log('🔍 Heavenletters Natural Language Query Tool');
    console.log('============================================\n');

    try {
      // Initialize the Gemini API
      this.initializeGemini(selectedModel);
      console.log('✅ Gemini API initialized\n');

      // Load the README file with schema documentation
      await this.loadSchemaDocumentation();
      console.log('✅ Schema documentation loaded\n');

      // Connect to database
      await this.connectToDatabase();
      console.log('✅ Database connection established\n');

      // Load saved queries
      await this.loadSavedQueries();

      // Start interactive session
      await this.startInteractiveSession();

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  initializeGemini(selectedModel) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'CHANGE_ME') {
      throw new Error('GEMINI_API_KEY is not set. Please add it to your .env file.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    const modelName = selectedModel || process.env.GEMINI_DEFAULT_MODEL || 'gemini-flash-latest';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.modelName = modelName;
    console.log(`🤖 Using Gemini model: ${modelName}`);
  }

  async loadSchemaDocumentation() {
    try {
      this.schemaContent = await fs.readFile(this.readmePath, 'utf8');
      console.log(`📚 Loaded schema documentation (${this.schemaContent.length} characters)`);
    } catch (error) {
      throw new Error(`Could not load schema documentation: ${error.message}`);
    }
  }

  async connectToDatabase() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not found. Please check backend/.env file.');
    }

    try {
      this.connection = await mysql.createConnection(databaseUrl);
      console.log('🔗 Connected to MySQL database');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async loadSavedQueries() {
    try {
      const data = await fs.readFile(this.queriesPath, 'utf8');
      this.savedQueries = JSON.parse(data);
      console.log('✅ Saved queries loaded.\n');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 No saved queries file found. A new one will be created.');
        await fs.writeFile(this.queriesPath, JSON.stringify({}));
      } else {
        throw new Error(`Could not load saved queries: ${error.message}`);
      }
    }
  }

  async saveQuery(sqlQuery) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const getLabel = () => {
      return new Promise(resolve => {
        rl.question('Enter a label for this query: ', resolve);
      });
    };

    const label = await getLabel();
    if (this.savedQueries[label]) {
      console.log(`Query with label "${label}" already exists. Overwriting.`);
    }

    const params = (sqlQuery.match(/\$([a-zA-Z0-9_]+)/g) || []).map(p => p.substring(1));

    this.savedQueries[label] = {
      sql: sqlQuery,
      params: params,
    };

    await fs.writeFile(this.queriesPath, JSON.stringify(this.savedQueries, null, 2));
    console.log(`✅ Query saved as "${label}".`);
    rl.close();
  }

  async executeSavedQuery(label) {
    const queryData = this.savedQueries[label];
    if (!queryData) {
      console.log(`❌ No query found with label "${label}".`);
      return;
    }

    let sql = queryData.sql;
    if (queryData.params && queryData.params.length > 0) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      for (const param of queryData.params) {
        const value = await new Promise(resolve => {
          rl.question(`Enter value for ${param}: `, resolve);
        });
        // A simple replacement. For production, you'd want to properly escape this.
        sql = sql.replace(`$${param}`, this.connection.escape(value));
      }
      rl.close();
    }

    await this.executeQuery(sql);
  }

  listSavedQueries() {
    console.log('💾 Saved Queries:');
    const labels = Object.keys(this.savedQueries);
    if (labels.length === 0) {
      console.log('  No queries saved yet.');
      return;
    }
    labels.forEach(label => {
      console.log(`  - ${label}`);
    });
  }

  async startInteractiveSession() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🌟 Query> '
    });

    console.log('Welcome to the Heavenletters Natural Query Tool!');
    console.log(`Using model: ${this.modelName}`);
    console.log('Type your question in natural language, or "quit" to exit.\n');
    console.log('Commands:');
    console.log('  list              - List saved queries');
    console.log('  run <label>       - Run a saved query');
    console.log('Examples:');
    console.log('  "How many German Heavenletters were translated by theophil?"');
    console.log('  "List all translators and their translation counts"');
    console.log('  "Show me the total number of published English Heavenletters"\n');

    rl.prompt();

    rl.on('line', async (input) => {
      const query = input.trim();

      if (query.toLowerCase() === 'quit' || query.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      if (query.toLowerCase() === 'list') {
        this.listSavedQueries();
      } else if (query.toLowerCase().startsWith('run ')) {
        const parts = query.split(' ');
        const label = parts.slice(1).join(' ');
        if (label) {
          await this.executeSavedQuery(label);
        } else {
          console.log('Please provide a label to run.');
        }
      } else if (query) {
        try {
          await this.processQuery(query);
        } catch (error) {
          console.error('❌ Query processing failed:', error.message);
        }
      }

      rl.prompt();
    });

    rl.on('close', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  async processQuery(naturalLanguageQuery) {
    let sqlQuery = await this.translateToSQLWithHistory(naturalLanguageQuery);
    let lastError = null;
    let attempts = 0;

    while (sqlQuery && attempts < 3) { // Limit to 3 correction attempts
      console.log('🔍 Generated SQL Query:');
      console.log('```sql');
      console.log(sqlQuery);
      console.log('```\n');

      const sampleQuery = `${sqlQuery} LIMIT 5`;
      const { rows, error } = await this.executeQuery(sampleQuery, true);

      if (error) {
        console.log('🔧 Query failed. Attempting to self-correct...');
        lastError = error;
        sqlQuery = await this.translateToSQLWithHistory(naturalLanguageQuery, lastError);
        attempts++;
      } else {
        // If query is successful, proceed with confirmation and full execution
        if (rows && rows.length > 0) {
          const confirmed = await this.confirmExecution();
          if (confirmed) {
            // IMPORTANT: We do not add the results of this full query to the history.
            // This is a critical cost-saving measure to avoid sending large datasets
            // back to the API in subsequent correction loops.
            await this.executeQuery(sqlQuery);
            const save = await this.askToSaveQuery();
            if (save) {
              await this.saveQuery(sqlQuery);
            }
          } else {
            console.log('⏭️  Full query execution cancelled\n');
          }
        } else if (rows) {
          console.log('⏭️  Sample query returned no results. No need to run full query.\n');
        }
        return; // Exit the loop
      }
    }

    if (attempts >= 3) {
      console.error('❌ Failed to correct the SQL query after 3 attempts.');
    }
  }

  async translateToSQL(naturalLanguageQuery) {
    console.log('🤖 Asking Gemini to translate to SQL...');

    const prompt = `
      You are an expert SQL developer. Based on the database schema provided below, translate the user's natural language query into a single, executable MySQL statement.

      **Schema:**
      ${this.schemaContent}

      **Query:**
      "${naturalLanguageQuery}"

      **SQL Statement:**
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const usage = response.usageMetadata;

      if (usage && usage.totalTokens) {
        const modelName = this.model.model;
        const costPerToken = this.tokenCostMap[modelName] || this.tokenCostMap['gemini-flash-latest'];
        const queryCost = usage.totalTokens * costPerToken;

        this.totalTokens += usage.totalTokens;
        this.totalCost += queryCost;

        console.log(`\n📊 API Usage:`);
        console.log(`   - Tokens: ${usage.totalTokens}`);
        console.log(`   - Cost: $${queryCost.toFixed(6)}`);
        console.log(`   - Session Total Cost: $${this.totalCost.toFixed(6)}\n`);
      }

      const sqlQuery = response.text()
        .replace(/```sql/g, '')
        .replace(/```/g, '')
        .trim();

      return sqlQuery;
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      return null;
    }
  }

  async translateToSQLWithHistory(naturalLanguageQuery, sqlError = null) {
    console.log('🤖 Asking Gemini to translate to SQL (with history)...');

    // Add the user's query to history
    this.history.push({ role: 'user', parts: [{ text: naturalLanguageQuery }] });

    // If there was a SQL error, add it to the history for context
    if (sqlError) {
      const errorText = `The previous SQL query failed with this error: ${sqlError}. Please provide a corrected SQL statement.`;
      this.history.push({ role: 'model', parts: [{ text: sqlError }] }); // Simulate the model's previous (failed) response
      this.history.push({ role: 'user', parts: [{ text: errorText }] }); // Ask for a correction
    }

    const chat = this.model.startChat({
      history: this.history,
      generationConfig: { maxOutputTokens: 1000 },
    });

    const result = await chat.sendMessage(naturalLanguageQuery);
    const response = result.response;

    const sqlQuery = response.text().replace(/```sql/g, '').replace(/```/g, '').trim();

    // Update history with the latest model response
    this.history.push({ role: 'model', parts: [{ text: sqlQuery }] });

    return sqlQuery;
  }

  async confirmExecution() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('⚠️  Execute the full query to get all results? (y/N): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async askToSaveQuery() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('💾 Save this query? (y/N): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async executeQuery(sqlQuery, isSample = false) {
    try {
      if (isSample) {
        console.log('📊 Sample Results:');
      } else {
        console.log('⚡ Executing full query...\n');
      }

      const [rows] = await this.connection.execute(sqlQuery);

      if (rows.length === 0) {
        console.log('📭 No results found\n');
        return { rows, error: null };
      }

      // Display results in a nice table format
      this.displayResults(rows);

      if (isSample) {
        console.log(`\n✅ Sample query executed successfully (${rows.length} rows returned)\n`);
      } else {
        console.log(`\n✅ Query executed successfully (${rows.length} rows returned)\n`);
      }

      return { rows, error: null };

    } catch (error) {
      console.error(`❌ Query execution failed: ${error.message}`);
      return { rows: null, error: error.message };
    }
  }

  displayResults(rows) {
    if (rows.length === 0) return;

    // Get column names from the first row
    const columns = Object.keys(rows[0]);

    // Calculate column widths
    const colWidths = {};
    columns.forEach(col => {
      colWidths[col] = Math.max(col.length, ...rows.map(row => String(row[col] || '').length));
    });

    // Create separator line
    const separator = columns.map(col => '-'.repeat(colWidths[col])).join(' | ');

    // Display header
    if (!isSample) {
      console.log('📊 Results:');
    }
    console.log(columns.map(col => col.padEnd(colWidths[col])).join(' | '));
    console.log(separator);

    // Display rows
    rows.forEach(row => {
      const values = columns.map(col => {
        const value = row[col];
        const str = value === null ? 'NULL' : String(value);
        return str.padEnd(colWidths[col]);
      });
      console.log(values.join(' | '));
    });
  }

  async cleanup() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

async function listModels(apiKey) {
  try {
    const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const models = response.data.models.map(model => model.name).filter(name => name.includes('gemini'));

    console.log('Available Gemini Models:');
    console.log('--------------------------');
    models.forEach((model, index) => console.log(` ${index + 1}. ${model}`));
    return models;

  } catch (error) {
    console.error('Error fetching models:', error.response ? error.response.data : error.message);
    throw new Error('Could not fetch model list from the API.');
  }
}

function selectModel(models) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\nEnter the number of the model to use (or press Enter for default): ', (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      if (index >= 0 && index < models.length) {
        resolve(models[index]);
      } else {
        resolve(null); // Default will be used
      }
    });
  });
}

async function handleArguments() {
  const args = process.argv.slice(2);
  if (args.includes('--list-models')) {
    let selectedModel = null;
    try {
      require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'CHANGE_ME') {
        throw new Error('GEMINI_API_KEY is not set. Please add it to your .env file.');
      }
      const models = await listModels(apiKey);
      selectedModel = await selectModel(models);
    } catch (error) {
      console.error('Failed to list or select models:', error.message);
      process.exit(1);
    }
    return selectedModel;
  }
  return null;
}

// Run the tool
if (require.main === module) {
  handleArguments().then(selectedModel => {
    const tool = new NaturalQueryTool();
    tool.initialize(selectedModel).catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
  });
}

module.exports = NaturalQueryTool;