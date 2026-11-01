import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import menu from '../data/menu.json';
import { MAX_ITEM_QUANTITY, sanitizeCartQuantities } from '../lib/cart.mjs';

type CartStore = {
  quantities: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartStore>()(persist((set) => ({
  quantities: {},
  add: (id) => set((state) => ({
    quantities: { ...state.quantities, [id]: Math.min((state.quantities[id] ?? 0) + 1, MAX_ITEM_QUANTITY) },
  })),
  remove: (id) => set((state) => {
    const next = { ...state.quantities };
    if ((next[id] ?? 0) <= 1) delete next[id];
    else next[id] -= 1;
    return { quantities: next };
  }),
  clear: () => set({ quantities: {} }),
}), {
    name: 'il-caminneto-cart-v1',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ quantities: state.quantities }),
    skipHydration: true,
    merge: (persisted, current) => ({
      ...current,
      quantities: sanitizeCartQuantities((persisted as { quantities?: unknown } | null)?.quantities, menu.items),
    }),
  },
));
