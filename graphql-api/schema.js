const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');

/**
 * Heavenletters GraphQL Schema based on Drupal 5.x structure
 * Simplified version to avoid circular references
 */

// Simple Heavenletter Type
const HeavenletterType = new GraphQLObjectType({
  name: 'Heavenletter',
  fields: {
    nid: { type: GraphQLNonNull(GraphQLInt) },
    vid: { type: GraphQLInt },
    title: { type: GraphQLString },
    number: { type: GraphQLInt },
    teaser: { type: GraphQLString },
    body: { type: GraphQLString },
    locale: { type: GraphQLString },
    language: { type: GraphQLString },
    created: { type: GraphQLString },
    changed: { type: GraphQLString },
    status: { type: GraphQLInt },
    author: { type: GraphQLString },
    pid: { type: GraphQLInt }
  }
});

// Simplified Translation Type
const TranslationType = new GraphQLObjectType({
  name: 'Translation',
  fields: {
    nid: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLString },
    locale: { type: GraphQLString },
    language: { type: GraphQLString }
  }
});

// Heaven Quotes type
const HeavenQuoteType = new GraphQLObjectType({
  name: 'HeavenQuote',
  fields: {
    nid: { type: GraphQLNonNull(GraphQLInt) },
    vid: { type: GraphQLInt },
    title: { type: GraphQLString },
    quote: { type: GraphQLString },
    author: { type: GraphQLString },
    locale: { type: GraphQLString },
    created: { type: GraphQLString },
    status: { type: GraphQLInt }
  }
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    heavenletter: {
      type: HeavenletterType,
      args: { nid: { type: GraphQLID } },
      resolve(parent, args, { db }) {
        return getHeavenletter(args.nid, db);
      }
    },
    heavenletters: {
      type: GraphQLList(HeavenletterType),
      args: {
        locale: { type: GraphQLString },
        limit: { type: GraphQLInt, defaultValue: 10 },
        offset: { type: GraphQLInt, defaultValue: 0 }
      },
      resolve(parent, args, { db }) {
        return getHeavenletters(args, db);
      }
    },
    heavenletterByNumber: {
      type: HeavenletterType,
      args: {
        number: { type: GraphQLInt },
        locale: { type: GraphQLString }
      },
      resolve(parent, args, { db }) {
        return getHeavenletterByNumber(args.number, args.locale, db);
      }
    },
    heavenletterTranslations: {
      type: GraphQLList(TranslationType),
      args: { nid: { type: GraphQLID } },
      resolve(parent, args, { db }) {
        return getHeavenletterTranslations(args.nid, db);
      }
    },
    heavenQuotes: {
      type: GraphQLList(HeavenQuoteType),
      args: {
        limit: { type: GraphQLInt, defaultValue: 10 },
        offset: { type: GraphQLInt, defaultValue: 0 }
      },
      resolve(parent, args, { db }) {
        return getHeavenQuotes(args, db);
      }
    }
  }
});

// Helper functions for data fetching
async function getHeavenletter(nid, db) {
  if (!db) {
    console.log('Mock mode: returning sample heavenletter data');
    return {
      nid: nid,
      title: `Heavenletter #${nid}`,
      number: nid,
      teaser: "God's message for today...",
      body: "Heaven letter content would be here...",
      locale: 'en',
      created: new Date().toISOString(),
      status: 1,
      author: 'Gloria Wendroff',
      pid: nid
    };
  }

  try {
    // Get basic node info and CCK fields
    const [nodeInfo] = await db.execute(`
      SELECT n.nid, n.vid, n.title, n.created, n.changed, n.status, n.uid,
                   u.name as author,
                   h.field_heavenletter__value as number,
                   h.field_proofed_value as teaser,
                   ln.locale, ln.pid
           FROM node n
      LEFT JOIN users u ON n.uid = u.uid
      LEFT JOIN content_type_heavenletters h ON n.vid = h.vid
      LEFT JOIN localizernode ln ON n.nid = ln.nid
      WHERE n.nid = ? AND n.type = 'heavenletters' AND n.status = 1
      LIMIT 1
    `, [nid]);

    if (nodeInfo.length === 0) return null;

    // Get the actual content from node_revisions
    const [revisionInfo] = await db.execute(`
      SELECT r.body
      FROM node_revisions r
      WHERE r.vid = ? AND r.nid = ?
      LIMIT 1
    `, [nodeInfo[0].vid, nid]);

    const letter = nodeInfo[0];
    const content = revisionInfo.length > 0 ? revisionInfo[0].body : '';

    return {
      ...letter,
      body: content,
      created: new Date(letter.created * 1000).toISOString(),
      changed: new Date(letter.changed * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error fetching heavenletter:', error);
    return null;
  }
}

async function getTranslations(pid, contentType, db) {
  try {
    const [rows] = await db.execute(`
      SELECT n.nid, n.title, ln.locale
      FROM node n
      INNER JOIN localizernode ln ON n.nid = ln.nid
      WHERE ln.pid = ? AND n.type = ? AND n.status = 1
      ORDER BY ln.locale
    `, [pid, contentType]);

    const translations = [];
    for (const row of rows) {
      translations.push(await getHeavenletter(row.nid, db));
    }
    return translations;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return [];
  }
}

async function getAdjacentContent(current, direction, contentType, db) {
  const operator = direction === 'next' ? '>' : '<';
  const order = direction === 'next' ? 'ASC' : 'DESC';

  try {
    const [rows] = await db.execute(`
      SELECT n.nid
      FROM node n
      INNER JOIN localizernode ln ON n.nid = ln.nid
      WHERE ln.locale = ? AND n.type = ? AND n.status = 1 AND n.nid != ?
      ORDER BY ln.locale ${order}
      LIMIT 1
    `, [current.locale, contentType, current.nid]);

    if (rows.length > 0) {
      return getHeavenletter(rows[0].nid, db);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${direction} content:`, error);
    return null;
  }
}


async function getHeavenletters(args, db) {
  const { locale, limit = 10, offset = 0 } = args;

  if (!db) {
    console.log('Mock mode: returning sample heavenletters list');
    const mockData = [];
    for (let i = 1; i <= limit; i++) {
      mockData.push({
        nid: offset + i,
        title: `Heavenletter #${offset + i}`,
        number: offset + i,
        locale: locale || 'en',
        created: new Date().toISOString(),
        status: 1,
        author: 'Gloria Wendroff',
        teaser: `Preview of heavenletter ${offset + i}...`,
        pid: offset + i
      });
    }
    return mockData;
  }

  try {
    let query = `
      SELECT n.nid, n.vid, n.title, n.created, n.changed, n.status, n.uid,
             u.name as author,
             h.field_heavenletter__value as number,
             h.field_proofed_value as teaser,
             ln.locale, ln.pid
      FROM node n
      LEFT JOIN users u ON n.uid = u.uid
      LEFT JOIN content_type_heavenletters h ON n.vid = h.vid
      LEFT JOIN localizernode ln ON n.nid = ln.nid
      WHERE n.type = 'heavenletters' AND n.status = 1
    `;

    const params = [];
    if (locale) {
      query += ' AND ln.locale = ?';
      params.push(locale);
    }

    query += ' ORDER BY n.created DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);

    // For each letter, add the actual content from node_revisions
    const lettersWithContent = await Promise.all(rows.map(async (letter) => {
      try {
        const [revisionInfo] = await db.execute(`
          SELECT r.body
          FROM node_revisions r
          WHERE r.vid = ? AND r.nid = ?
          LIMIT 1
        `, [letter.vid, letter.nid]);

        const content = revisionInfo.length > 0 ? revisionInfo[0].body : '';
        const combinedTeaser = letter.teaser || content.substring(0, 300);

        return {
          ...letter,
          body: content,
          teaser: combinedTeaser,
          created: new Date(letter.created * 1000).toISOString(),
          changed: new Date(letter.changed * 1000).toISOString()
        };
      } catch (error) {
        console.error(`Error fetching content for letter ${letter.nid}:`, error);
        return letter;
      }
    }));

    return lettersWithContent;
  } catch (error) {
    console.error('Error fetching heavenletters:', error);
    throw new Error('Failed to fetch heavenletters');
  }
}

async function getHeavenletterByNumber(number, locale, db) {
  if (!db) {
    console.log('Mock mode: returning sample heavenletter by number');
    return {
      nid: number,
      title: `Heavenletter #${number}`,
      number: number,
      locale: locale || 'en',
      created: new Date().toISOString(),
      status: 1,
      author: 'Gloria Wendroff',
      pid: number
    };
  }

  try {
    const [rows] = await db.execute(`
      SELECT n.nid
      FROM node n
      LEFT JOIN content_type_heavenletters h ON n.vid = h.vid
      LEFT JOIN localizernode ln ON n.nid = ln.nid
      WHERE h.field_heavenletter__value = ? AND ln.locale = ? AND n.type = 'heavenletters' AND n.status = 1
      LIMIT 1
    `, [number, locale || 'en']);

    if (rows.length > 0) {
      return getHeavenletter(rows[0].nid, db);
    }
    return null;
  } catch (error) {
    console.error('Error fetching heavenletter by number:', error);
    return null;
  }
}

async function getHeavenletterTranslations(nid, db) {
  if (!db) {
    console.log('Mock mode: returning sample translations');
    return [
      { nid: nid, title: `Heavenletter #${nid}`, locale: 'en', language: 'English' },
      { nid: nid + 1000, title: `Carta del Cielo #${nid}`, locale: 'es', language: 'Spanish' },
      { nid: nid + 2000, title: `Lettre du Ciel #${nid}`, locale: 'fr', language: 'French' }
    ];
  }

  try {
    // First get the PID (parent translation ID) for this heavenletter
    const [pidResult] = await db.execute(`
      SELECT ln.pid FROM localizernode ln WHERE ln.nid = ? LIMIT 1
    `, [nid]);

    if (pidResult.length === 0) return [];

    const pid = pidResult[0].pid;

    // Get all translations for this PID
    const [rows] = await db.execute(`
      SELECT n.nid, n.title, ln.locale
      FROM node n
      INNER JOIN localizernode ln ON n.nid = ln.nid
      WHERE ln.pid = ? AND n.type = 'heavenletters' AND n.status = 1
      ORDER BY ln.locale
    `, [pid]);

    return rows.map(row => ({
      nid: row.nid,
      title: row.title,
      locale: row.locale,
      language: getLanguageName(row.locale)
    }));
  } catch (error) {
    console.error('Error fetching heavenletter translations:', error);
    return [];
  }
}

async function getHeavenQuotes(args, db) {
  const { limit = 10, offset = 0 } = args;

  if (!db) {
    console.log('Mock mode: returning sample quotes');
    const mockData = [];
    for (let i = 1; i <= limit; i++) {
      mockData.push({
        nid: offset + i,
        title: `Heaven Quote #${offset + i}`,
        quote: `God's wisdom quote ${offset + i}...`,
        author: 'Gloria Wendroff',
        locale: 'en',
        created: new Date().toISOString(),
        status: 1
      });
    }
    return mockData;
  }

  // Implementation for heaven quotes from database
  return [];
}

async function getHeavenSutra(nid, db) {
  // Placeholder for sutra implementation
  return null;
}

async function getHeavenSutras(args, db) {
  // Placeholder for sutras list
  return [];
}

function getLanguageName(locale) {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'tr': 'Turkish',
    'ru': 'Russian',
    'hr': 'Croatian'
  };
  return languages[locale] || locale;
}

module.exports = new GraphQLSchema({
  query: RootQuery
});