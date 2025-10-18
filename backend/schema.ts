import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  integer,
  json,
} from '@keystone-6/core/fields';

export const lists = {
  User: list({
    access: {
      operation: {
        create: ({ session }) => !!session?.data && session.data.role === 'admin',
        update: ({ session, item }: any) => {
          if (!session?.data) return false;
          if (session.data.role === 'admin') return true;
          if (item?.id === session.data.id) return true; // self update
          return false;
        },
        delete: ({ session }) => !!session?.data && session.data.role === 'admin',
        query: ({ session }) => !!session?.data,
      },
      filter: {
        query: ({ session }) => {
          if (!session?.data) return false;
          if (session.data.role === 'admin') return true;
          return { id: { equals: session.data.id } };
        },
        update: ({ session }) => {
          if (!session?.data) return false;
          if (session.data.role === 'admin') return true;
          return { id: { equals: session.data.id } };
        },
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        isFilterable: true,
      }),
      password: password({
        validation: {
          isRequired: true,
          length: { min: 8 }
        }
      }),
      bio: text({
        ui: {
          displayMode: 'textarea',
        },
      }),
      role: select({
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Author', value: 'author' },
          { label: 'Translator', value: 'translator' },
        ],
        defaultValue: 'author',
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      posts: relationship({ ref: 'Post.author', many: true }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'email', 'role', 'bio'],
      },
    },
  }),
  Heavenletter: list({
    access: {
      operation: {
        create: ({ session }) => !!session?.data && session.data.role === 'admin',
        update: ({ session }) => !!session?.data && session.data.role === 'admin',
        delete: ({ session }) => !!session?.data && session.data.role === 'admin',
        query: ({ session }) => !!session?.data,
      },
    },
    fields: {
      permalink: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      title: text({ validation: { isRequired: true } }),
      body: text({
        validation: { isRequired: true },
        ui: {
          displayMode: 'textarea',
        },
      }),
      locale: text({
        validation: { isRequired: true, length: { min: 2, max: 8 } },
        isIndexed: true,
      }),
      publishNumber: integer({
        isFilterable: true,
      }),
      publishedOn: timestamp(),
      writtenOn: timestamp(),
      nid: integer(),
      tnid: integer(),
      tags: json(),
      embeddings: json(),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
      updatedAt: timestamp({
        ui: {
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
        },
      }),
    },
    ui: {
      labelField: 'title',
      listView: {
        initialColumns: ['title', 'locale', 'publishNumber', 'publishedOn', 'permalink'],
      },
    },
  }),
  Post: list({
    ui: {
      isHidden: true,
    },
    access: {
      operation: {
        create: ({ session }) => !!session?.data && ['admin', 'author'].includes(session.data.role),
        update: ({ session, item }: any) => {
          if (!session?.data) return false;
          if (session.data.role === 'admin') return true;
          if (session.data.role === 'author' && item?.author === session.data.id) return true;
          return false;
        },
        delete: ({ session }) => !!session?.data && session.data.role === 'admin',
        query: ({ session }) => !!session?.data,
      },
    },
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: text({
        ui: {
          displayMode: 'textarea',
        },
      }),
      status: select({
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ],
        defaultValue: 'draft',
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },
        many: false,
      }),
      tags: relationship({
        ref: 'Tag.posts',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
      publishedAt: timestamp(),
    },
  }),
  Tag: list({
    access: {
      operation: {
        create: ({ session }) => !!session?.data && ['admin', 'author'].includes(session.data.role),
        update: ({ session }) => !!session?.data && ['admin', 'author'].includes(session.data.role),
        delete: ({ session }) => !!session?.data && session.data.role === 'admin',
        query: ({ session }) => !!session?.data,
      },
    },
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),
};