import { unstable_cache } from "next/cache";
import { getOptimizedImageUrl } from "@/lib/utils";

export const getBlurDataUrl = unstable_cache(
  async (imageUrl: string): Promise<string> => {
    try {
      const tinyUrl = getOptimizedImageUrl(imageUrl, {
        width: 16,
        quality: 10,
        format: "webp",
      });
      const res = await fetch(tinyUrl);
      if (!res.ok) return "";
      const buffer = await res.arrayBuffer();
      return `data:image/webp;base64,${Buffer.from(buffer).toString("base64")}`;
    } catch {
      return "";
    }
  },
  ["blur-data-url"],
  { revalidate: 60 * 60 * 24 * 30 }
);
