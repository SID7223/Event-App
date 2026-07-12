import { Hono } from 'hono';
import { Env } from '../env';
import { query, first } from '../lib/db';
import { success } from '../lib/response';

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface VibeRow {
  id: string;
  label: string;
  icon: string;
  sort_order: number;
}

interface VibeCategoryRow {
  category_id: string;
}

interface EventCountRow {
  count: number;
}

export function register(app: Hono<{ Bindings: Env }>) {
  app.get('/categories', async (c) => {
    const categories = await query<CategoryRow>(
      c.env.chillingz_db,
      'SELECT * FROM categories ORDER BY sort_order ASC'
    );

    const data = await Promise.all(categories.map(async (cat) => {
      const count = await first<EventCountRow>(
        c.env.chillingz_db,
        "SELECT COUNT(*) as count FROM events WHERE category_id = ? AND status = 'active'",
        cat.id
      );
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        count: count?.count ?? 0,
      };
    }));

    return success(c, data);
  });

  app.get('/vibes', async (c) => {
    const vibes = await query<VibeRow>(
      c.env.chillingz_db,
      'SELECT * FROM vibes ORDER BY sort_order ASC'
    );

    const data = await Promise.all(vibes.map(async (vibe) => {
      const vibeCats = await query<VibeCategoryRow>(
        c.env.chillingz_db,
        'SELECT category_id FROM vibe_categories WHERE vibe_id = ?',
        vibe.id
      );

      const categories = await Promise.all(
        vibeCats.map(vc => first<CategoryRow>(
          c.env.chillingz_db,
          'SELECT * FROM categories WHERE id = ?',
          vc.category_id
        ))
      );

      return {
        id: vibe.id,
        label: vibe.label,
        icon: vibe.icon,
        categories: categories
          .filter((c): c is CategoryRow => c !== null)
          .map(c => c.name),
      };
    }));

    return success(c, data);
  });
}
