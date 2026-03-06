export type DummyProfilePost = {
  id: number;
  src: string;
  alt: string;
};

export const galleryPosts: DummyProfilePost[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
    alt: "A group of children taking a cheerful selfie together.",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    alt: "A wide green valley surrounded by mountains under a bright sky.",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=900&q=80",
    alt: "A minimalist wooden interior with warm lighting.",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    alt: "A plated dish with vegetables arranged neatly.",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=900&q=80",
    alt: "A colorful flower field in full bloom.",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=900&q=80",
    alt: "A smiling child with friends in the background.",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=900&q=80",
    alt: "Two children sitting together and smiling at camera.",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1542736667-069246bdbc74?auto=format&fit=crop&w=900&q=80",
    alt: "Kids playing around a table indoors.",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    alt: "A calm blue ocean under clear sky.",
  },
];

export const likedPosts: DummyProfilePost[] = [...galleryPosts];
export const savedPosts: DummyProfilePost[] = [];
