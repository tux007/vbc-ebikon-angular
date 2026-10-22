import { defineType, defineField } from 'sanity';

export const newsPost = defineType({
  name: 'newsPost',
  title: 'Bericht',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: { list: ['Matchbericht', 'Verein', 'Junioren', 'Junior:innen', 'Spezial'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'publishedAt', title: 'Datum', type: 'date', validation: r => r.required() }),
    defineField({ name: 'image', title: 'Bild', type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' },
  },
  orderings: [{ title: 'Datum (neu → alt)', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
});
