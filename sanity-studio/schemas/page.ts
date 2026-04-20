import { defineType, defineField } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Statische Seite',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'slug', title: 'Slug (URL-Pfad)', type: 'string',
      description: 'z.B. "hallen", "beach", "dokumente", "kontakt"',
      validation: r => r.required(),
    }),
    defineField({
      name: 'body', title: 'Inhalt', type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'documents', title: 'Dokumente (PDFs / Downloads)', type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Bezeichnung', type: 'string', validation: r => r.required() }),
          defineField({ name: 'file',  title: 'Datei',       type: 'file' }),
        ],
        preview: { select: { title: 'title' } },
      }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug' },
  },
});
