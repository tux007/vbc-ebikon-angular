import { defineType, defineField } from 'sanity';

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'document',
  fields: [
    defineField({ name: 'name',        title: 'Teamname',    type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug',        title: 'Slug (URL)',  type: 'slug',   options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'description', title: 'Beschreibung', type: 'text', rows: 4 }),
    defineField({
      name: 'gender', title: 'Geschlecht', type: 'string',
      options: { list: [{ title: 'Damen / Juniorinnen', value: 'f' }, { title: 'Herren', value: 'm' }] },
    }),
    defineField({ name: 'level', title: 'Liga / Kategorie', type: 'string' }),
    defineField({ name: 'photo', title: 'Teamfoto',  type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'level', media: 'photo' },
  },
});
