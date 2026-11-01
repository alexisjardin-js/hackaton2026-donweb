import { create } from 'zustand';

type CartStore = {
  quantities: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartStore>((set) => ({
  quantities: {},
  add: (id) => set((state) => ({
    quantities: { ...state.quantities, [id]: (state.quantities[id] ?? 0) + 1 },
  })),
  remove: (id) => set((state) => {
    const next = { ...state.quantities };
    if ((next[id] ?? 0) <= 1) delete next[id];
    else next[id] -= 1;
    return { quantities: next };
  }),
  clear: () => set({ quantities: {} }),
}));
