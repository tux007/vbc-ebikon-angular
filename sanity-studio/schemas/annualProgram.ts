import { defineArrayMember, defineField, defineType } from 'sanity';

export const annualProgram = defineType({
  name: 'annualProgram',
  title: 'Jahresprogramm',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      initialValue: 'Jahresprogramm',
      validation: r => r.required(),
    }),
    defineField({
      name: 'programYear',
      title: 'Jahreszahl',
      type: 'number',
      validation: r => r.required(),
      description: 'Wird als grosse Jahreszahl im Hintergrund angezeigt.',
    }),
    defineField({
      name: 'body',
      title: 'Einleitung (optional)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'events',
      title: 'Eintraege',
      type: 'array',
      validation: r => r.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'startDate', title: 'Startdatum', type: 'date', validation: r => r.required() }),
            defineField({ name: 'endDate', title: 'Enddatum', type: 'date' }),
            defineField({ name: 'description', title: 'Beschreibung', type: 'string', validation: r => r.required() }),
            defineField({
              name: 'category',
              title: 'Kategorie',
              type: 'string',
              options: {
                list: [
                  { title: 'Vereinsanlass', value: 'Vereinsanlass' },
                  { title: 'Spezialtraining', value: 'Spezialtraining' },
                  { title: 'Spieltag', value: 'Spieltag' },
                  { title: 'Trainingsweekend', value: 'Trainingsweekend' },
                  { title: 'Volleyballlager', value: 'Volleyballlager' },
                ],
                layout: 'radio',
              },
              validation: r => r.required(),
            }),
          ],
          preview: {
            select: {
              title: 'description',
              startDate: 'startDate',
              endDate: 'endDate',
              subtitle: 'category',
            },
            prepare(selection) {
              const dateLabel = selection.endDate
                ? `${selection.startDate} - ${selection.endDate}`
                : selection.startDate;

              return {
                title: selection.title,
                subtitle: `${selection.subtitle} | ${dateLabel}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'programYear',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Jahresprogramm',
        subtitle: selection.subtitle ? `Jahr ${selection.subtitle}` : 'Ohne Jahr',
      };
    },
  },
});
