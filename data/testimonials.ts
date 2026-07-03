import type { Testimonial } from "@/types";

const AVATAR = "/trainers/placeholder.svg";

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "James Whitmore",
    role: "Lost 24kg in 8 months",
    quote:
      "Royal Fitness didn't just change my body — it changed my discipline. The coaching is world-class and the space feels like a private club.",
    image: AVATAR,
    rating: 5,
  },
  {
    id: "t2",
    name: "Priya Nair",
    role: "Marathon finisher",
    quote:
      "I came in unable to run 2km. My coach built a plan around my life and I crossed the finish line six months later. Unreal support.",
    image: AVATAR,
    rating: 5,
  },
  {
    id: "t3",
    name: "Carlos Mendez",
    role: "Gained 9kg lean mass",
    quote:
      "The Diamond membership is worth every cent. Dedicated coach, recovery zone, and a community that pushes you. Truly elite.",
    image: AVATAR,
    rating: 5,
  },
  {
    id: "t4",
    name: "Hannah Lee",
    role: "Postpartum transformation",
    quote:
      "Supportive, professional, and never intimidating. The trainers understood my goals and the facilities are immaculate.",
    image: AVATAR,
    rating: 5,
  },
  {
    id: "t5",
    name: "Devon Clarke",
    role: "Powerlifting PB +40kg",
    quote:
      "Best strength coaching I've had anywhere. Programming is precise and the equipment is top tier. This place is built for results.",
    image: AVATAR,
    rating: 5,
  },
];
