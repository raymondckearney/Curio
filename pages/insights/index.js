import Head from 'next/head'
import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { postsQuery } from '../../sanity/lib/queries'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export async function getStaticProps() {
  try {
    const posts = await client.fetch(postsQuery)
    return { props: { posts }, revalidate: 60 }
  } catch {
    return { props: { posts: [] }, revalidate: 60 }
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function InsightsPage({ posts }) {
  return (
    <>
      <Head>
        <title>Insights | Curio</title>
        <meta name="description" content="Perspectives on talent, learning, and what it means to think differently." />
      </Head>
      <Nav />
      <main className="insights-main">
        <section className="insights-hero">
          <div className="container">
            <h1 className="insights-heading">Insights</h1>
            <p className="insights-subhead">
              Perspectives on talent, learning, and what it means to think differently.
            </p>
          </div>
        </section>

        <section className="insights-grid-section">
          <div className="container">
            {posts.length === 0 ? (
              <p className="insights-empty">No posts yet — check back soon.</p>
            ) : (
              <div className="insights-grid">
                {posts.map((post) => (
                  <Link key={post.slug.current} href={`/insights/${post.slug.current}`} className="insight-card">
                    <div className="insight-card-inner">
                      {post.categories && post.categories.length > 0 && (
                        <span className="insight-category">{post.categories[0].title}</span>
                      )}
                      <h2 className="insight-title">{post.title}</h2>
                      {post.excerpt && (
                        <p className="insight-excerpt">{post.excerpt}</p>
                      )}
                      <div className="insight-meta">
                        <span className="insight-date">{formatDate(post.publishedAt)}</span>
                        {post.author && (
                          <span className="insight-author">By {post.author}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
