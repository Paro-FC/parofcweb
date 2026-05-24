import { defineType, defineField } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const coachingStaff = defineType({
  name: 'coachingStaff',
  title: 'Coaching Staff',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g. Head coach, Assistant coach, Goalkeeping coach',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optional photo for staff card',
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'string',
      options: {
        list: [
          { title: "Men's Team", value: 'mens' },
          { title: "Women's Team", value: 'womens' },
          { title: 'Both Teams', value: 'both' },
        ],
        layout: 'radio',
      },
      description: 'Which team this staff member belongs to',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'staffCategory' }],
      description: 'Staff category for grouping (manage categories under Staff Category)',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: (rule) => rule.min(0),
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { name: 'name', role: 'role' },
    prepare({ name, role }) {
      return {
        title: name || 'Unnamed',
        subtitle: role || '',
      }
    },
  },
})
