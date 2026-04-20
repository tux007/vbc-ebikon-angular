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
    defineField({
      name: 'trainingTimes',
      title: 'Trainingszeiten',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'day', title: 'Tag', type: 'string' }),
          defineField({ name: 'time', title: 'Zeit', type: 'string' }),
          defineField({ name: 'location', title: 'Ort / Halle', type: 'string' }),
        ],
        preview: {
          select: { day: 'day', time: 'time', location: 'location' },
          prepare({ day, time, location }) {
            const left = [day, time].filter(Boolean).join(', ');
            return { title: left || 'Training', subtitle: location || '' };
          },
        },
      }],
    }),
    defineField({
      name: 'players',
      title: 'SpielerInnen',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'coaches',
      title: 'TrainerInnen',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'rankingLink', title: 'Direktlink Rangliste', type: 'url' }),
    defineField({ name: 'groupId', title: 'VolleyManager Group-ID (für API-Rangliste)', type: 'string' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'level', media: 'photo' },
  },
});
