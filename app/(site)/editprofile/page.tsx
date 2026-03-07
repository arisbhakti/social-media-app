"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-[18px] leading-[28px] font-bold text-[var(--base-pure-white)] md:text-[16px] md:leading-[24px]"
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        className="h-[64px] rounded-[16px] border-[rgba(126,145,183,0.2)] bg-[rgba(6,16,31,0.72)] px-4 text-[16px] leading-[24px] text-[var(--base-pure-white)] shadow-none placeholder:text-[rgba(164,167,174,0.7)] focus-visible:border-[rgba(127,81,249,0.88)] focus-visible:ring-0"
      />
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

            <div className="space-y-5 md:space-y-6">
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

              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className="block text-[18px] leading-[28px] font-bold text-[var(--base-pure-white)] md:text-[16px] md:leading-[24px]"
                >
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={updateField("bio")}
                  rows={4}
                  className="min-h-[140px] rounded-[16px] border-[rgba(126,145,183,0.2)] bg-[rgba(6,16,31,0.72)] px-4 py-4 text-[16px] leading-[34px] text-[var(--base-pure-white)] shadow-none placeholder:text-[rgba(164,167,174,0.7)] focus-visible:border-[rgba(127,81,249,0.88)] focus-visible:ring-0 md:min-h-[132px] md:leading-[36px]"
                />
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="mt-2 h-[58px] w-full rounded-full bg-[linear-gradient(90deg,#7f51f9_0%,#6936f2_100%)] text-[16px] leading-[24px] font-semibold text-[var(--base-pure-white)] hover:bg-[linear-gradient(90deg,#7f51f9_0%,#6936f2_100%)] md:h-[56px]"
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
