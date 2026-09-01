import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, fetchNearbyPosts, reactToPost } from '@/lib/api';
import type { LngLat, Post, Reaction } from '@/types/post';

/**
 * Nearby posts for a location and radius, refetched whenever either changes,
 * plus the ability to react to one (which removes it from the list) and to
 * refetch on demand - the map calls that after a new post is written.
 */
export function useNearbyPosts(center: LngLat | null, radiusMetres: number) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reacting, setReacting] = useState(false);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!center) return;

    // A slower earlier request must not overwrite a newer result.
    const id = ++requestId.current;

    try {
      const result = await fetchNearbyPosts(center, radiusMetres);
      if (id !== requestId.current) return;
      setError(null);
      setPosts(result);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof ApiError ? e.message : String(e));
    }
  }, [center, radiusMetres]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const react = useCallback(async (post: Post, reaction: Reaction) => {
    setReacting(true);

    try {
      await reactToPost(post.id, reaction);
      setPosts((current) => current.filter((p) => p.id !== post.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setReacting(false);
    }
  }, []);

  return { posts, error, reacting, react, refresh };
}
