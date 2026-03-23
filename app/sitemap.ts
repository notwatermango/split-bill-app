import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: "https://split.notwatermango.cc", lastModified: new Date() },
        {
            url: "https://split.notwatermango.cc/summary",
            lastModified: new Date(),
        },
    ];
}
