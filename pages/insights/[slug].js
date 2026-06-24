import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '../../sanity/lib/client'
import { postBySlugQuery, postSlugsQuery } from '../../sanity/lib/queries'
import { urlFor } from '../../sanity/lib/image'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export async function getStaticPaths() {
  try {
    const slugs = await client.fetch(postSlugsQuery)
    return {
      paths: slugs.map((slug) => ({ params: { slug } })),
      fallback: 'blocking',
    }
  } catch {
    return { paths: [], fallback: 'blocking' }
  }
}

export async function getStaticProps({ params }) {
  const post = await client.fetch(postBySlugQuery, { slug: params.slug })
  if (!post) return { notFound: true }
  return { props: { post }, revalidate: 60 }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const portableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="post-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="post-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="post-h3">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="post-blockquote">{children}</blockquote>,
    normal: ({ children }) => <p className="post-p">{children}</p>,
  },
}

export default function InsightPost({ post }) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).fit('crop').url()
    : null

  return (
    <>
      <Head>
        <title>{post.title} | Curio Insights</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Head>
      <Nav />
      <main className="post-main">
        <article className="post-article">
          <div className="container post-container">
            <Link href="/insights" className="post-back">← All Insights</Link>

            {post.categories && post.categories.length > 0 && (
              <div className="post-categories">
                {post.categories.map((cat, i) => (
                  <span key={i} className="insight-category">{cat.title}</span>
                ))}
              </div>
            )}

            <h1 className="post-heading">{post.title}</h1>

            <div className="post-byline">
              {post.author && <span>By {post.author}</span>}
              {post.author && post.publishedAt && <span className="post-byline-sep">·</span>}
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            </div>

            {imageUrl && (
              <div className="post-hero-image">
                <Image
                  src={imageUrl}
                  alt={post.mainImage.alt || post.title}
                  width={1200}
                  height={630}
                  style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                  priority
                />
              </div>
            )}

            {post.body && (
              <div className="post-body">
                <PortableText value={post.body} components={portableTextComponents} />
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
