"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/app-toast";
import { myProfileData } from "@/lib/profile-mock";

type ProfileFormData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
};

const INITIAL_FORM_DATA: ProfileFormData = {
  name: myProfileData.name,
  username: myProfileData.username,
  email: myProfileData.email,
  phone: myProfileData.phone,
  bio: myProfileData.bio,
};

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
};

function ProfileField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: FieldProps) {
  return (
    <div className="grid gap-0.5">
      <Label className="text-sm font-bold" htmlFor={id}>
        {label}
      </Label>
      <div className="flex h-12 items-center rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5">
        <Input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  const updateField =
    (field: keyof ProfileFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((currentData) => ({
        ...currentData,
        [field]: event.target.value,
      }));
    };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/myprofile");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 450));

    showSuccessToast("Profile Success Update");
    router.push("/myprofile");
  };

  return (
    <main className="flex w-full flex-1 justify-center px-4 pt-0 pb-8 md:px-0 md:pb-16">
      <section className="w-full max-w-200">
        <div className="hidden items-center gap-3 md:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Go back"
            onClick={handleBack}
            className="size-8"
          >
            <IoArrowBackOutline className="size-8" />
          </Button>
          <h1 className="display-xs font-bold ">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
          <div className="flex flex-col gap-8 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:items-start md:gap-10">
            <div className="flex flex-col items-center gap-6 pt-2 md:pt-0">
              <Avatar className="size-20 md:32.5 border border-[rgba(126,145,183,0.3)] md:size-[130px]">
                <AvatarImage
                  src={myProfileData.avatarSrc}
                  alt={myProfileData.name}
                />
                <AvatarFallback>
                  {myProfileData.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                type="button"
                variant="ghost"
                className="h-10 md:h-12 w-40 rounded-full border border-neutral-900 px-6 font-bold text-sm md:text-md"
              >
                Change Photoss
              </Button>
            </div>

            <div className="grid gap-5">
              <ProfileField
                id="name"
                label="Name"
                value={formData.name}
                onChange={updateField("name")}
                autoComplete="name"
              />

              <ProfileField
                id="username"
                label="Username"
                value={formData.username}
                onChange={updateField("username")}
                autoComplete="username"
              />

              <ProfileField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={updateField("email")}
                autoComplete="email"
              />

              <ProfileField
                id="phone"
                label="Number Phone"
                type="tel"
                value={formData.phone}
                onChange={updateField("phone")}
                autoComplete="tel"
              />

              <div className="grid gap-0.5">
                <Label className="text-sm font-bold" htmlFor="bio">
                  Bio
                </Label>
                <div className="flex min-h-[132px] items-start rounded-[18px] border border-neutral-900 box-border bg-neutral-950 px-5 py-3.5">
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={updateField("bio")}
                    rows={4}
                    className="text-md h-full min-h-[104px] w-full resize-none border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="ghost"
                disabled={isSaving}
                className="text-md flex h-11 md:h-12 w-full items-center justify-center rounded-full bg-primary-300 font-bold text-base-pure-white transition-transform duration-200 hover:scale-[1.01] hover:bg-primary-200 hover:text-base-pure-white active:scale-[0.99]"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
