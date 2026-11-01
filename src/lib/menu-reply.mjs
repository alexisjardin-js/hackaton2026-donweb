import { z } from 'zod';

const replySchema = z.object({
  answer: z.string().trim().min(1).max(1000),
  suggestedItemIds: z.array(z.string()).max(4),
}).strict();

export function normalizeMenuReply(raw, menu) {
  try {
    const parsed = replySchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const validIds = new Set(menu.items.map((item) => item.id));
    return {
      answer: parsed.data.answer,
      suggestedItemIds: [...new Set(parsed.data.suggestedItemIds.filter((id) => validIds.has(id)))].slice(0, 3),
    };
  } catch {
    return null;
  }
}
