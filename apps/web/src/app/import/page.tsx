"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, source: "wikipedia" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "Import failed");
        return;
      }
      setStatus(data.updated ? `Updated: ${data.page.title}` : `Imported: ${data.page.title}`);
    } catch {
      setStatus("Import failed — check your connection and sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Content</h1>
        <p className="mt-2 text-muted-foreground">
          Import Wikipedia articles with automatic wikitext parsing, formatting, and link detection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wikipedia Import</CardTitle>
          <CardDescription>Paste a Wikipedia URL or article title. Requires sign-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImport} className="space-y-4">
            <Input
              placeholder="https://en.wikipedia.org/wiki/TypeScript"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              aria-label="Wikipedia URL or title"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Importing…" : "Import Article"}
            </Button>
          </form>
          {status && <p className="mt-4 text-sm text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
