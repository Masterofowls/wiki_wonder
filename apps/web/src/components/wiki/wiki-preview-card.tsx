import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WikiPreviewCardProps {
  slug: string;
  title: string;
  summary?: string | null;
  sourceType?: string | null;
}

export function WikiPreviewCard({ slug, title, summary, sourceType }: WikiPreviewCardProps) {
  return (
    <Link href={`/wiki/${slug}`} className="group block">
      <Card className="transition-colors group-hover:border-primary/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {sourceType && sourceType !== "local" && (
              <Badge variant="secondary" className="shrink-0 capitalize">
                {sourceType}
              </Badge>
            )}
          </div>
          {summary && <CardDescription className="line-clamp-2">{summary}</CardDescription>}
        </CardHeader>
        <CardContent>
          <span className="text-sm text-primary">Read article →</span>
        </CardContent>
      </Card>
    </Link>
  );
}
