import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chatbidan.com";
  const now = new Date();

  return [
    // === HIGHEST PRIORITY - Landing / Home ===
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },

    // === HIGH PRIORITY - Core features ===
    {
      url: `${baseUrl}/bidans`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/janin`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },

    // === SEO Landing Pages ===
    ...[
      "tanya-bidan",
      "konsultasi-bidan",
      "konsultasi-kehamilan",
      "konsultasi-nifas",
      "konsultasi-menyusui",
      "kesehatan-reproduksi",
    ].map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // === MEDIUM PRIORITY - User flow ===
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // === LOWER PRIORITY - Authenticated pages ===
    {
      url: `${baseUrl}/profile`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bookings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/notifications`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.4,
    },
  ];
}
