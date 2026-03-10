import { PostCard } from "@/components/site/post-card";
import { Separator } from "@/components/ui/separator";

const postImages = [
  {
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    alt: "A group of children taking a cheerful selfie together.",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    alt: "A wide green valley surrounded by mountains under a bright sky.",
  },
  {
    src: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80",
    alt: "A minimalist wooden interior with warm lighting.",
  },
  {
    src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    alt: "A crowd enjoying a concert with warm stage lights.",
  },
];

export function HomeFeed() {
  return (
    <section className="flex w-full max-w-[600px] flex-col gap-6">
      {postImages.map((post, index) => (
        <div key={post.src} className="grid gap-5">
          <PostCard
            imageSrc={post.src}
            imageAlt={post.alt}
            liked={index === 0}
            hasInitialComments={index === 0}
          />
          {index < postImages.length - 1 ? (
            <Separator className="bg-neutral-900" />
          ) : null}
        </div>
      ))}
    </section>
  );
}
