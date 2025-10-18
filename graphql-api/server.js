const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mysql = require('mysql2/promise');
const cors = require('cors');
const schema = require('./schema');

require('dotenv').config();

/**
 * Heavenletters GraphQL API Server
 * Can connect directly to Drupal database or use exported JSON data
 */

const app = express();
const PORT = process.env.PORT || 4000;

// Database configuration
const getDbConfig = () => ({
  host: process.env.DB_HOST || '192.168.8.103',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mojah42',
  database: process.env.DB_NAME || 'heaven',
  // Enable multiple statements for complex queries
  multipleStatements: true,
  // Connection timeout
  connectTimeout: 60000,
  // Acquire timeout
  acquireTimeout: 60000,
});

// Database connection pool
let dbPool = null;

async function createDbConnection() {
  try {
    if (!dbPool) {
      dbPool = mysql.createPool(getDbConfig());
      console.log('✅ Database connection pool created');
    }
    return dbPool;
  } catch (error) {
    console.error('❌ Failed to create database connection:', error.message);
    console.log('⚠️  Falling back to mock data mode');
    return null;
  }
}

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Serve static files (for testing)
app.use(express.static('../'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const db = await createDbConnection();
    if (db) {
      const [result] = await db.execute('SELECT 1 as ping');
      res.json({
        status: 'healthy',
        database: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        status: 'healthy',
        database: 'mock-mode',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      uptime: process.uptime()
    });
  }
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP(async (request, response) => {
  let db = null;
  try {
    db = await createDbConnection();

    return {
      schema: schema,
      graphiql: true, // Enable GraphQL playground
      context: { db, request }, // Pass db connection to resolvers
      customFormatErrorFn: (error) => {
        console.error('GraphQL Error:', error.message);
        return {
          message: error.message,
          locations: error.locations,
          stack: error.stack ? error.stack.split('\n') : [],
          path: error.path
        };
      }
    };
  } catch (error) {
    console.error('❌ GraphQL endpoint error:', error);
    throw error;
  }
}));

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Heavenletters GraphQL API Server...');

    const db = await createDbConnection();
    if (db) {
      console.log('✅ Database connection established');
    } else {
      console.log('⚠️  Running in mock data mode');
    }

    app.listen(PORT, () => {
      console.log(`\n📡 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);

      console.log('📝 Available Queries:');
      console.log('  heavenletters(locale: String): List of heavenletters');
      console.log('  heavenletter(nid: Int): Single heavenletter by ID');
      console.log('  heavenletterByNumber(number: Int, locale: String): Single heavenletter');
      console.log('  heavenSutras: List of heaven sutras');
      console.log('  heavenQuotes: List of heaven quotes\n');

      console.log('🌐 Example Query:');
      console.log(`query {
  heavenletters(limit: 3) {
    nid
    title
    number
    locale
    created
    author
    translations {
      nid
      title
      locale
    }
  }
}\n`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutdown signal received');
  if (dbPool) {
    await dbPool.end();
    console.log('🔌 Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Interrupt signal received');
  if (dbPool) {
    await dbPool.end();
    console.log('🔌 Database connection closed');
  }
  process.exit(0);
});

startServer();