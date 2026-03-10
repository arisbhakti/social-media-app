"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/components/ui/app-toast";
import { getAuthSession, saveAuthSession } from "@/lib/auth-session";

type ProfileFormData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
};

type ApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData | null;
};

type MyProfileData = {
  profile: {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
};

type UpdatedProfileData = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string | null;
  avatarUrl: string | null;
  updatedAt: string;
};

const INITIAL_FORM_DATA: ProfileFormData = {
  name: "",
  username: "",
  email: "",
  phone: "",
  bio: "",
};

const MAX_AVATAR_SIZE_IN_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const FALLBACK_AVATAR_SRC = "/dummy-profile-image.png";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
};

function ProfileField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  disabled = false,
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
          disabled={disabled}
          className="text-md h-full w-full border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildApiError(
  responseStatus: number,
  fallbackMessage: string,
  responseBody?: { message?: string } | null
) {
  return new ApiError(responseBody?.message ?? fallbackMessage, responseStatus);
}

async function parseApiBody<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

function validateAvatar(file: File | null) {
  if (!file) {
    return null;
  }

  if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
    return "Avatar must be PNG, JPG, or WEBP.";
  }

  if (file.size > MAX_AVATAR_SIZE_IN_BYTES) {
    return "Avatar max size is 5MB.";
  }

  return null;
}

async function getMyProfile(token: string | null) {
  const headers: HeadersInit = {
    accept: "*/*",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch("/api/me", {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const body = await parseApiBody<ApiResponse<MyProfileData>>(response);
  if (!response.ok || !body?.success || !body.data) {
    throw buildApiError(response.status, "Failed to fetch profile", body);
  }

  return body.data.profile;
}

async function updateMyProfile(token: string | null, formData: FormData) {
  const headers: HeadersInit = {
    accept: "*/*",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch("/api/me", {
    method: "PATCH",
    headers,
    body: formData,
    cache: "no-store",
  });

  const body = await parseApiBody<ApiResponse<UpdatedProfileData>>(response);
  if (!response.ok || !body?.success || !body.data) {
    throw buildApiError(response.status, "Failed to update profile", body);
  }

  return {
    message: body.message,
    profile: body.data,
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const avatarPreviewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      const token = getAuthSession()?.token ?? null;

      setIsLoadingProfile(true);

      try {
        const profile = await getMyProfile(token);
        if (isCancelled) {
          return;
        }

        setFormData({
          name: profile.name,
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio ?? "",
        });
        setAvatarUrl(profile.avatarUrl);
      } catch (error) {
        if (!isCancelled) {
          if (isUnauthorizedError(error)) {
            showErrorToast("Unauthorized");
            router.push("/login");
            return;
          }

          showErrorToast(getErrorMessage(error, "Failed to fetch profile"));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [router]);

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

  const openAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const validationError = validateAvatar(file);

    if (validationError) {
      setAvatarError(validationError);
      event.target.value = "";
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    event.target.value = "";
  };

  const handleAvatarReset = () => {
    setAvatarFile(null);
    setAvatarError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving || isLoadingProfile) {
      return;
    }

    const token = getAuthSession()?.token ?? null;

    const name = formData.name.trim();
    const username = formData.username.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const bio = formData.bio.trim();

    if (!name || !username || !email || !phone) {
      showErrorToast("Name, username, email, and phone are required.");
      return;
    }

    const payload = new FormData();
    payload.append("name", name);
    payload.append("username", username);
    payload.append("email", email);
    payload.append("phone", phone);
    payload.append("bio", bio);

    if (avatarFile) {
      payload.append("avatar", avatarFile);
    } else if (avatarUrl) {
      payload.append("avatarUrl", avatarUrl);
    }

    setIsSaving(true);

    try {
      const response = await updateMyProfile(token, payload);
      const { profile } = response;

      setAvatarUrl(profile.avatarUrl ?? null);

      if (token) {
        saveAuthSession(token, {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
        });
        window.dispatchEvent(new Event("storage"));
      }

      showSuccessToast(response.message);
      router.push("/myprofile");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        showErrorToast("Unauthorized");
        router.push("/login");
        return;
      }

      showErrorToast(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  const avatarDisplaySrc = avatarPreviewUrl ?? avatarUrl ?? FALLBACK_AVATAR_SRC;
  const avatarFallbackText = formData.name.slice(0, 2).toUpperCase() || "U";
  const isSubmitDisabled = isLoadingProfile || isSaving;

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
          <h1 className="display-xs font-bold">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 md:mt-8">
          <div className="flex flex-col gap-8 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:items-start md:gap-10">
            <div className="flex flex-col items-center gap-6 pt-2 md:pt-0">
              <Avatar className="size-20 border border-[rgba(126,145,183,0.3)] md:size-[130px]">
                <AvatarImage src={avatarDisplaySrc} alt={formData.name} />
                <AvatarFallback>{avatarFallbackText}</AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                id="avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <Button
                type="button"
                variant="ghost"
                onClick={openAvatarPicker}
                disabled={isSubmitDisabled}
                className="h-10 md:h-12 w-40 rounded-full border border-neutral-900 px-6 font-bold text-sm md:text-md"
              >
                Change Photo
              </Button>

              {avatarFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAvatarReset}
                  disabled={isSubmitDisabled}
                  className="h-9 rounded-full border border-neutral-900 px-4 text-sm font-bold hover:bg-transparent"
                >
                  Remove New Photo
                </Button>
              ) : null}

              {avatarError ? (
                <p className="text-center text-[14px] leading-[20px] font-medium text-[var(--red)]">
                  {avatarError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5">
              <ProfileField
                id="name"
                label="Name"
                value={formData.name}
                onChange={updateField("name")}
                autoComplete="name"
                disabled={isSubmitDisabled}
              />

              <ProfileField
                id="username"
                label="Username"
                value={formData.username}
                onChange={updateField("username")}
                autoComplete="username"
                disabled={isSubmitDisabled}
              />

              <ProfileField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={updateField("email")}
                autoComplete="email"
                disabled={isSubmitDisabled}
              />

              <ProfileField
                id="phone"
                label="Number Phone"
                type="tel"
                value={formData.phone}
                onChange={updateField("phone")}
                autoComplete="tel"
                disabled={isSubmitDisabled}
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
                    disabled={isSubmitDisabled}
                    className="text-md h-full min-h-[104px] w-full resize-none border-0 bg-transparent p-0 text-base-pure-white shadow-none placeholder:text-neutral-600 placeholder:font-semibold focus-visible:border-transparent focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="ghost"
                disabled={isSubmitDisabled}
                className="text-md flex h-11 md:h-12 w-full items-center justify-center rounded-full bg-primary-300 font-bold text-base-pure-white transition-transform duration-200 hover:scale-[1.01] hover:bg-primary-200 hover:text-base-pure-white active:scale-[0.99]"
              >
                {isLoadingProfile
                  ? "Loading profile..."
                  : isSaving
                    ? "Saving..."
                    : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
