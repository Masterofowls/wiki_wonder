import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { slugifyTitle } from "./schemas";

function remarkWikiLinks() {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined || typeof node.value !== "string") return;

      const pattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      if (!pattern.test(node.value)) return;

      pattern.lastIndex = 0;
      const children: Array<{ type: "text"; value: string } | { type: "link"; url: string; children: Array<{ type: "text"; value: string }> }> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          children.push({ type: "text", value: node.value.slice(lastIndex, match.index) });
        }

        const target = match[1]?.trim() ?? "";
        const label = match[2]?.trim() ?? target;
        children.push({
          type: "link",
          url: `/wiki/${slugifyTitle(target)}`,
          children: [{ type: "text", value: label }],
        });

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < node.value.length) {
        children.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...(children as never[]));
    });
  };
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkWikiLinks)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

export function extractPlainText(markdown: string, maxLength = 300): string {
  const text = markdown
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1")
    .replace(/[#>*_`~\[\]()!|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}
