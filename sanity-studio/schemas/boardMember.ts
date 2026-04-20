import { defineType, defineField } from 'sanity';

export const boardMember = defineType({
  name: 'boardMember',
  title: 'Vorstandsmitglied',
  type: 'document',
  fields: [
    defineField({ name: 'name',  title: 'Name',    type: 'string', validation: r => r.required() }),
    defineField({ name: 'role',  title: 'Funktion', type: 'string', validation: r => r.required() }),
    defineField({ name: 'email', title: 'E-Mail',  type: 'email' }),
    defineField({ name: 'photo', title: 'Foto',    type: 'image', options: { hotspot: true }, validation: r => r.required() }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
});
