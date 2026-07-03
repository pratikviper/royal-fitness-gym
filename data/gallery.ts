import type { GalleryCategory, GalleryImage } from "@/types";

/**
 * Real Royal Fitness photos from /public/gym. The grid + lightbox are agnostic
 * to the source, so add more shots here as they come in.
 */
export const galleryCategories: (GalleryCategory | "All")[] = [
  "All",
  "Strength",
  "Cardio",
  "Facilities",
];

export const galleryImages: GalleryImage[] = [
  {
    id: "g1",
    src: "/gym/gym-1.png",
    alt: "Free-weights and dumbbell zone at Royal Fitness",
    category: "Strength",
    span: "wide",
  },
  {
    id: "g2",
    src: "/gym/gym-2.png",
    alt: "Cardio zone with treadmills and stair climber",
    category: "Cardio",
    span: "normal",
  },
  {
    id: "g3",
    src: "/gym/gym-3.png",
    alt: "Functional turf, strength machines and boxing area",
    category: "Facilities",
    span: "normal",
  },
  {
    id: "g4",
    src: "/gym/gym-4.png",
    alt: "Plate-loaded strength machines and supplement bar",
    category: "Strength",
    span: "wide",
  },
  {
    id: "g5",
    src: "/gym/gym-5.png",
    alt: "Strength training floor with the Champion Mentality mural",
    category: "Strength",
    span: "normal",
  },
  {
    id: "g6",
    src: "/gym/gym-6.png",
    alt: "Spin bikes and cardio equipment by the windows",
    category: "Cardio",
    span: "normal",
  },
];
