"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SearchResult {
  slug: string;
  title: string;
  summary: string | null;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  isLoading: boolean;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: "",
  results: [],
  isOpen: false,
  isLoading: false,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ query: "", results: [], isOpen: false, isLoading: false }),
}));

interface BookmarkState {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug) ? state.slugs.filter((s) => s !== slug) : [...state.slugs, slug],
        })),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: "wikiwonder-bookmarks" },
  ),
);
