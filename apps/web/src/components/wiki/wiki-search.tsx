"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchStore } from "@/stores/wiki-store";

export function WikiSearch() {
  const router = useRouter();
  const { query, results, isLoading, setQuery, setResults, setLoading } = useSearchStore();
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debounced)}&limit=8`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { results?: Array<{ slug: string; title: string; summary: string | null }> }) => {
        setResults(data.results ?? []);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debounced, setLoading, setResults]);

  const onSelect = useCallback(
    (slug: string) => {
      router.push(`/wiki/${slug}`);
      setQuery("");
      setResults([]);
    },
    [router, setQuery, setResults],
  );

  return (
    <Command shouldFilter={false} className="rounded-lg border border-border shadow-md">
      <CommandInput
        placeholder="Search wiki pages…"
        value={query}
        onValueChange={setQuery}
        aria-label="Search wiki"
      />
      <CommandList>
        {isLoading && <CommandEmpty>Searching…</CommandEmpty>}
        {!isLoading && debounced && results.length === 0 && <CommandEmpty>No pages found.</CommandEmpty>}
        {!isLoading && results.length > 0 && (
          <CommandGroup heading="Pages">
            {results.map((result) => (
              <CommandItem key={result.slug} value={result.slug} onSelect={() => onSelect(result.slug)}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{result.title}</span>
                  {result.summary && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">{result.summary}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
