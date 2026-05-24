import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const staffCategory = defineType({
  name: 'staffCategory',
  title: 'Staff Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'e.g. Coaching Staff, Medical Staff, Technical Staff',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first in the staff section',
      validation: (rule) => rule.min(0),
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Title', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare({ title, order }) {
      return {
        title: title || 'Unnamed',
        subtitle: order != null ? `Order: ${order}` : '',
      }
    },
  },
})
