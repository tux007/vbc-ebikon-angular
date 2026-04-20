import { defineArrayMember, defineField, defineType } from 'sanity';

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
      name: 'programYear',
      title: 'Jahreszahl',
      type: 'number',
      hidden: ({ document }) => document?.slug !== 'jahresprogramm',
      description: 'Wird als grosse Hintergrund-Jahreszahl im Jahresprogramm verwendet.',
    }),
    defineField({
      name: 'annualProgramEvents',
      title: 'Jahresprogramm Eintraege',
      type: 'array',
      hidden: ({ document }) => document?.slug !== 'jahresprogramm',
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
