import { defineField, defineType } from 'sanity'

export const profileType = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title / Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
    }),
    defineField({
      name: 'portraitUrl',
      title: 'Portrait Image URL (Optional)',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'about',
      title: 'About Paragraph',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'aboutDescription',
      title: 'Contact Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'github', title: 'GitHub URL', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
      ],
    }),
    defineField({
      name: 'typewriterTexts',
      title: 'Typewriter Headline Texts',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
})
