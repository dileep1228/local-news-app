import { useCallback, useEffect, useState } from 'react';

import { ApiError, fetchNearbyPosts, reactToPost } from '@/lib/api';
import type { LngLat, Post, Reaction } from '@/types/post';

/**
 * Nearby posts for a location and radius, refetched whenever either changes,
 * plus the ability to react to one (which removes it from the list).
 */
export function useNearbyPosts(center: LngLat | null, radiusMetres: number) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    if (!center) return;

    let cancelled = false;

    async function load() {
      try {
        const result = await fetchNearbyPosts(center!, radiusMetres);
        // A slower earlier request must not overwrite a newer result.
        if (!cancelled) {
          setError(null);
          setPosts(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : String(e));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [center, radiusMetres]);

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

  return { posts, error, reacting, react };
}
