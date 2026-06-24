export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  categories[]->{title},
  "author": author->name
}`

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  categories[]->{title},
  "author": author->name,
  body
}`

export const postSlugsQuery = `*[_type == "post" && defined(slug.current)][].slug.current`
