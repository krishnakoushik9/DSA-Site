import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                    profile {
                        ranking
                        reputation
                        starRating
                    }
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com',
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        const data = await response.json();

        if (data.errors) {
            return NextResponse.json({ error: data.errors[0].message }, { status: 400 });
        }

        return NextResponse.json(data.data);
    } catch (error) {
        console.error('Error fetching LeetCode profile:', error);
        return NextResponse.json({ error: 'Failed to fetch LeetCode profile' }, { status: 500 });
    }
}
