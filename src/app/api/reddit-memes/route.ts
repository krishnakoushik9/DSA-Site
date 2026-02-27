import { NextRequest, NextResponse } from 'next/server';

export interface RedditPost {
    id: string;
    title: string;
    author: string;
    score: number;
    url: string;
    permalink: string;
    thumbnail: string;
    preview?: {
        images: {
            source: { url: string; width: number; height: number };
        }[];
    };
    is_video: boolean;
    selftext: string;
    created_utc: number;
    num_comments: number;
    post_hint?: string;
}

const SUBREDDITS = ['aimemes', 'ProgrammerHumor'];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sub = searchParams.get('sub') || 'aimemes';
    const sort = searchParams.get('sort') || 'hot';
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 50);

    // Only allow whitelisted subreddits
    const safeSubreddit = SUBREDDITS.includes(sub) ? sub : 'aimemes';

    try {
        const res = await fetch(
            `https://www.reddit.com/r/${safeSubreddit}/${sort}.json?limit=${limit}&raw_json=1`,
            {
                headers: {
                    'User-Agent': 'KavStrat-DSATracker/1.0 (educational app)',
                    Accept: 'application/json',
                },
                // Cache for 5 minutes
                next: { revalidate: 300 },
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: `Reddit API returned ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();
        const rawPosts = json?.data?.children ?? [];

        const posts: RedditPost[] = rawPosts
            .map((child: { data: RedditPost }) => child.data)
            // Only image or gallery posts (filter out pure text / NSFW)
            .filter((p: RedditPost) => {
                if (p.is_video) return false;
                if (!p.preview && !p.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return false;
                return true;
            })
            .map((p: RedditPost) => ({
                id: p.id,
                title: p.title,
                author: p.author,
                score: p.score,
                url: p.url,
                permalink: `https://reddit.com${p.permalink}`,
                thumbnail: p.thumbnail,
                preview: p.preview,
                is_video: p.is_video,
                selftext: p.selftext,
                created_utc: p.created_utc,
                num_comments: p.num_comments,
                post_hint: p.post_hint,
            }));

        return NextResponse.json(
            { posts, subreddit: safeSubreddit, sort },
            {
                headers: {
                    'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error) {
        console.error('Reddit API error:', error);
        return NextResponse.json({ error: 'Failed to fetch from Reddit' }, { status: 500 });
    }
}
