import type { GalleryCategory, GalleryImage } from "@/types";

/**
 * Gallery imagery uses Unsplash for a rich default look. Replace `src` values
 * with your own /public assets when ready — the grid + lightbox are agnostic.
 */
const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const galleryCategories: (GalleryCategory | "All")[] = [
  "All",
  "Strength",
  "Cardio",
  "Classes",
  "Facilities",
  "Transformations",
];

export const galleryImages: GalleryImage[] = [
  { id: "g1", src: u("1534438327276-14e5300c3a48"), alt: "Athlete training with barbell", category: "Strength", span: "tall" },
  { id: "g2", src: u("1571019613454-1cb2f99b2d8b"), alt: "Group class in session", category: "Classes", span: "normal" },
  { id: "g3", src: u("1517836357463-d25dfeac3438"), alt: "Members on the strength floor", category: "Strength", span: "wide" },
  { id: "g4", src: u("1526506118085-60ce8714f8c5"), alt: "Loaded barbell close up", category: "Strength", span: "normal" },
  { id: "g5", src: u("1581009146145-b5ef050c2e1e"), alt: "Woman performing deadlift", category: "Transformations", span: "tall" },
  { id: "g6", src: u("1540497077202-7c8a3999166f"), alt: "Modern gym interior", category: "Facilities", span: "normal" },
  { id: "g7", src: u("1549060279-7e168fcee0c2"), alt: "Runner on treadmill", category: "Cardio", span: "normal" },
  { id: "g8", src: u("1584735935682-2f2b69dff9d2"), alt: "Kettlebell swing", category: "Strength", span: "normal" },
  { id: "g9", src: u("1594381898411-846e7d193883"), alt: "Dumbbell rack detail", category: "Facilities", span: "wide" },
  { id: "g10", src: u("1550345332-09e3ac987658"), alt: "Rowing conditioning", category: "Cardio", span: "tall" },
  { id: "g11", src: u("1591258370814-01609b341790"), alt: "Boxing training", category: "Classes", span: "normal" },
  { id: "g12", src: u("1517963879433-6ad2b056d712"), alt: "Yoga studio session", category: "Classes", span: "normal" },
];
