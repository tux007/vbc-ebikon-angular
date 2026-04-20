import { defineType, defineField } from 'sanity';

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  fields: [
    defineField({ name: 'name',   title: 'Name',         type: 'string',  validation: r => r.required() }),
    defineField({ name: 'url',    title: 'Website-URL',  type: 'url' }),
    defineField({ name: 'order',  title: 'Reihenfolge',  type: 'number',  initialValue: 0 }),
    defineField({ name: 'active', title: 'Aktiv',        type: 'boolean', initialValue: true }),
    defineField({ name: 'logo',   title: 'Logo',         type: 'image',   options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'url', media: 'logo' },
  },
});
