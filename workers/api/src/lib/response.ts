import type { Context } from 'hono';

export function success<T>(c: Context, data: T, status: number = 200) {
  return c.json({ success: true, data }, status as any);
}

export function created<T>(c: Context, data: T) {
  return c.json({ success: true, data }, 201 as any);
}

export function deleted(c: Context) {
  return c.json({ success: true, data: null }, 200 as any);
}

export function paginated<T>(
  c: Context,
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return c.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}
