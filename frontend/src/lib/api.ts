import { API_URL, USER_ID } from '@/constants/config';
import type { LngLat, Post, Reaction } from '@/types/post';

/**
 * Thrown for anything that stops a request succeeding, so callers don't have to
 * distinguish "server said no" from "never reached the server" themselves.
 */
export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch (e) {
    // fetch only throws when the server was never reached at all.
    throw new ApiError(`Could not reach the server: ${e}`);
  }
}

export async function fetchNearbyPosts(
  [longitude, latitude]: LngLat,
  radiusMetres: number,
): Promise<Post[]> {
  const query = new URLSearchParams({
    user_id: String(USER_ID),
    latitude: String(latitude),
    longitude: String(longitude),
    radius: String(radiusMetres),
    sort: 'score',
    limit: '100',
  });

  const response = await request(`/posts/nearby?${query}`);

  if (!response.ok) {
    throw new ApiError(`Server returned ${response.status}`, response.status);
  }

  return response.json();
}

export async function createPost(
  [longitude, latitude]: LngLat,
  message: string,
): Promise<Post> {
  const response = await request('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: USER_ID,
      message,
      location: { latitude, longitude },
    }),
  });

  if (!response.ok) {
    // The body carries a readable reason for 400 (validation, duplicate) and
    // 429 (cooldown), so surface it rather than a bare status code.
    const reason = await response.text().catch(() => '');
    throw new ApiError(reason || `Server returned ${response.status}`, response.status);
  }

  return response.json();
}

export async function reactToPost(postId: number, reaction: Reaction): Promise<void> {
  const response = await request(`/posts/${postId}/reaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: USER_ID, reaction }),
  });

  // 409 means we already reacted to this post. The caller wants it gone from
  // the feed either way, so this is not a failure worth surfacing.
  if (!response.ok && response.status !== 409) {
    throw new ApiError(`Reaction failed: ${response.status}`, response.status);
  }
}
