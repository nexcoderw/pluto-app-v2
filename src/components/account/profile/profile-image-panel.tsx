"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera, ImageUp, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  uploadUserProfileImage,
  type UserAuthProfile,
} from "@/services/api/auth";
import { ApiRequestError } from "@/services/api/errors";
import styles from "./account-profile-page.module.css";

type ProfileImagePanelProps = {
  user: UserAuthProfile;
  onUserUpdated: (user: UserAuthProfile) => void;
};

const maxProfileImageSize = 5_000_000;

export function ProfileImagePanel({
  user,
  onUserUpdated,
}: ProfileImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const avatarUrl = previewUrl ?? user.imageUrl;
  const uploadMutation = useMutation({
    mutationFn: uploadUserProfileImage,
    onSuccess: (response) => {
      onUserUpdated(response.user);
      setPreviewUrl(null);
      toast.success("Profile image updated.", {
        description: "Your new image will now appear across your account.",
      });
    },
    onError: (error) => {
      setPreviewUrl(null);

      if (error instanceof ApiRequestError) {
        toast.error("Image upload failed.", {
          description: error.message,
        });
        return;
      }

      toast.error("Image upload failed.", {
        description: "Choose another image and try again.",
      });
    },
  });
  const initials = getInitials(user.fullName || user.email);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Unsupported file type.", {
        description: "Upload an image file only.",
      });
      return;
    }

    if (file.size > maxProfileImageSize) {
      toast.error("Image is too large.", {
        description: "Upload an image that is 5 MB or smaller.",
      });
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    uploadMutation.mutate({ file });
  }

  return (
    <section className={styles.imagePanel}>
      <div className={styles.avatarStage}>
        <span
          className={styles.profileAvatar}
          data-has-image={Boolean(avatarUrl)}
          style={
            avatarUrl
              ? ({
                  "--account-avatar-image": `url("${avatarUrl}")`,
                } as CSSProperties)
              : undefined
          }
          aria-hidden="true"
        >
          {avatarUrl ? null : initials}
        </span>
        <span className={styles.cameraBadge}>
          {uploadMutation.isPending ? (
            <Loader2 aria-hidden="true" className={styles.spinner} />
          ) : (
            <Camera aria-hidden="true" />
          )}
        </span>
      </div>

      <div className={styles.panelHeader}>
        <span>
          <ShieldCheck aria-hidden="true" />
          Profile image
        </span>
        <h2>{user.fullName}</h2>
        <p>
          Use a clear image so partners can recognize the customer attached to a
          booking request.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/heic,image/heif"
        className={styles.fileInput}
        onChange={handleFileChange}
      />

      <Button
        type="button"
        className={styles.uploadButton}
        disabled={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadMutation.isPending ? (
          <Loader2 aria-hidden="true" className={styles.spinner} />
        ) : (
          <ImageUp aria-hidden="true" />
        )}
        Upload image
      </Button>

      <div className={styles.imageRules}>
        <span>Accepted: PNG, JPG, WebP, GIF, AVIF, HEIC</span>
        <span>Maximum size: 5 MB</span>
      </div>
    </section>
  );
}

function getInitials(value: string) {
  const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
