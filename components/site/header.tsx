import Image from "next/image";
import { IoSearchOutline } from "react-icons/io5";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="flex w-full flex-col bg-[var(--base-pure-black)] text-[var(--base-pure-white)]">
      <div className="flex h-[72px] items-center justify-between px-4 py-0 md:px-[120px]">
        <div className="flex items-center gap-3">
          <Image
            src="/icon-sociality.svg"
            alt="Sociality icon"
            width={28}
            height={28}
            priority
          />
          <span className="display-xs leading-none font-bold">Sociality</span>
        </div>

        <div className="hidden w-full max-w-[500px] md:flex">
          <div className="relative w-full">
            <IoSearchOutline className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[var(--neutral-500)]" />
            <Input
              type="search"
              placeholder="Search"
              aria-label="Search"
              className="h-[42px] rounded-full border-[rgba(126,145,183,0.2)] bg-[rgba(6,16,31,0.9)] px-4 pl-11 text-[14px] leading-[20px] text-[var(--base-pure-white)] shadow-none placeholder:text-[var(--neutral-500)] focus-visible:border-[rgba(126,145,183,0.48)] focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Avatar className="size-8 border border-[rgba(126,145,183,0.32)]">
            <AvatarImage src="/dummy-profile-image.png" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="text-[14px] leading-[20px] font-bold">John Doe</span>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open search"
            className="size-8 rounded-full p-0 text-[var(--base-pure-white)] hover:bg-[rgba(126,145,183,0.18)]"
          >
            <IoSearchOutline className="size-[20px]" />
          </Button>
          <Avatar className="size-8 border border-[rgba(126,145,183,0.32)]">
            <AvatarImage src="/dummy-profile-image.png" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <Separator className="bg-[rgba(126,145,183,0.2)]" />
    </header>
  );
}
