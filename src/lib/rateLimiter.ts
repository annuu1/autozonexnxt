const store = new Map<string, { count: number; expires: number }>();

export async function rateLimit(
  key: string,
  { limit, window }: { limit: number; window: number }
) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expires < now) {
    store.set(key, { count: 1, expires: now + window });
    return { success: true, limit, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }

  entry.count += 1;
  store.set(key, entry);
  return { success: true, limit, remaining: limit - entry.count };
}
