import { config } from '@keystone-6/core';
import { lists } from './schema';
// import { withAuth, session } from './auth';
import dotenv from 'dotenv';

dotenv.config();
console.log('Keystone: dotenv loaded, DATABASE_URL=', process.env.DATABASE_URL);
console.log('Keystone: KEYSTONE_PORT=', process.env.KEYSTONE_PORT);

export const keystoneConfig = config({
  db: {
    provider: 'mysql',
    url: process.env.DATABASE_URL!,
  },
  lists,
  // Temporarily disable session and auth to test basic functionality
  // session,
  server: {
    cors: {
      origin: true,
      credentials: true,
    },
    port: 3000,
  },
  ui: {
    // Temporarily disable UI access control to test basic functionality
    isAccessAllowed: () => true,
  },
  // Temporarily disable GraphQL extensions to test basic functionality
  // graphql: {
  //   extendGraphqlSchema: (schema: any) => {
  //     // Use graphql-js to extend the generated schema with typeDefs, then attach a resolver to the new field.
  //     const { parse, extendSchema } = require('graphql');
  //     const typeDefs = `
  //       extend type Query {
  //         heavenlettersByTitle(search: String, title: String): [Heavenletter]
  //         heavenletterByNumber(number: Int): Heavenletter
  //         heavenletterByPermalink(permalink: String!, locale: String): Heavenletter
  //       }
  //     `;
  //     const extended = extendSchema(schema, parse(typeDefs));
  //     // Attach resolver directly to the new field on the Query type.
  //     const queryType = extended.getType('Query');
  //     if (queryType && (queryType as any).getFields) {
  //       const fields = (queryType as any).getFields();
  //       fields.heavenlettersByTitle.resolve = async (_root: any, args: { search?: string, title?: string }, context: any) => {
  //         const search = args.search || args.title;
  //         console.log('Keystone: heavenlettersByTitle resolver called with args.search=', args.search, 'args.title=', args.title, 'resolved search=', search);
  //         if (!search) return [];
  //         // Use Keystone's query API. MySQL default collations are usually
  //         // case-insensitive, so `contains` will typically behave insensitively.
  //         try {
  //           return await context.query.Heavenletter.findMany({
  //             where: {
  //               title: {
  //                 contains: search,
  //               },
  //             },
  //           });
  //         } catch (err) {
  //           console.warn('Keystone: query failed in heavenlettersByTitle resolver, error=', err);
  //           return [];
  //         }
  //       };
  //       fields.heavenletterByNumber.resolve = async (_root: any, args: { number?: number }, context: any) => {
  //         const num = args.number;
  //         console.log('Keystone: heavenletterByNumber resolver called with number=', num);
  //         if (typeof num !== 'number') return null;
  //         try {
  //           // Prefer findOne for unique fields if available; otherwise fall back to findMany.
  //           if (typeof context.query.Heavenletter.findOne === 'function') {
  //             return await context.query.Heavenletter.findOne({ where: { publishNumber: num } });
  //           }
  //           const items = await context.query.Heavenletter.findMany({ where: { publishNumber: num }, take: 1 });
  //           return items && items.length ? items[0] : null;
  //         } catch (err) {
  //           console.warn('Keystone: query failed in heavenletterByNumber resolver, error=', err);
  //           return null;
  //         }
  //       };
  //       fields.heavenletterByPermalink.resolve = async (_root: any, args: { permalink: string, locale?: string }, context: any) => {
  //         const { permalink, locale } = args;
  //         console.log('Keystone: heavenletterByPermalink resolver called with permalink=', permalink, 'locale=', locale);
  //         if (!permalink) return null;
  //         try {
  //           const where = { permalink: { equals: permalink } };
  //           if (locale) {
  //             (where as any).locale = { equals: locale };
  //           }
  //           // Prefer findOne for unique fields if available; otherwise fall back to findMany.
  //           if (typeof context.query.Heavenletter.findOne === 'function') {
  //             return await context.query.Heavenletter.findOne({ where });
  //           }
  //           const items = await context.query.Heavenletter.findMany({ where, take: 1 });
  //           return items && items.length ? items[0] : null;
  //         } catch (err) {
  //           console.warn('Keystone: query failed in heavenletterByPermalink resolver, error=', err);
  //           return null;
  //         }
  //       };
  //     }
  //     return extended;
  //   },
  // },
  // Temporarily disable UI access control to test basic functionality
  // ui: {
  //   isAccessAllowed: (context: any) => {
  //     const session = context.session;
  //     return !!session?.data && session.data.isActive === 'true' && ['admin', 'author', 'translator'].includes(session.data.role);
  //   },
  // },
});

console.log('Keystone: keystoneConfig built, extendGraphqlSchema present=', !!(keystoneConfig as any).graphql?.extendGraphqlSchema);

// Temporarily disable auth wrapper to test basic functionality
// export default withAuth(keystoneConfig);
export default keystoneConfig;