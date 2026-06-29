type ClassValue = string | number | boolean | null | undefined | ClassValue[];

function flattenClassValues(values: ClassValue[]): string[] {
  const result: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === "string") {
      result.push(v);
    } else if (typeof v === "number") {
      result.push(String(v));
    } else if (Array.isArray(v)) {
      result.push(...flattenClassValues(v));
    }
  }
  return result;
}

export function cn(...inputs: ClassValue[]): string {
  return flattenClassValues(inputs).join(" ").trim();
}
