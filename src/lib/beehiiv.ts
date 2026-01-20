// Beehiiv API integration
const BEEHIIV_API_KEY = import.meta.env.BEEHIIV_API_KEY || 'yTnY3t3g1oB5xpE3i6m7p0urYlB0YkM8Y17WX58mWWdEATRVlrWQKzhqI1uI34KV';
const BEEHIIV_PUBLICATION_ID = import.meta.env.BEEHIIV_PUBLICATION_ID || 'pub_eef97a64-405c-43b4-b0d0-6c6fb5c858c1';

const BEEHIIV_API_BASE = 'https://api.beehiiv.com/v2';

export interface BeehiivPost {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  status: string;
  publish_date: number | null;
  displayed_date: number | null;
  thumbnail_url: string | null;
  web_url: string;
  audience: string;
  content_tags: string[];
}

export interface BeehiivPostsResponse {
  data: BeehiivPost[];
  page: number;
  limit: number;
  total_results: number;
  total_pages: number;
}

export async function getPublishedPosts(limit = 20) {
  try {
    const response = await fetch(
      BEEHIIV_API_BASE + '/publications/' + BEEHIIV_PUBLICATION_ID + '/posts?status=confirmed&limit=' + limit + '&expand=free_web_content',
      {
        headers: {
          'Authorization': 'Bearer ' + BEEHIIV_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Beehiiv API error:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch Beehiiv posts:', error);
    return [];
  }
}

export function formatPostDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getPostDate(post) {
  const timestamp = post.displayed_date || post.publish_date;
  return timestamp ? new Date(timestamp * 1000) : new Date();
}
