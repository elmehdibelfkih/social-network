"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import { fetchMediaClient } from "@/libs/apiFetch";


export type AvatarHolderProps = React.HTMLAttributes<HTMLDivElement> & {
  avatarId?: number | null;
  size?: number;
  alt?: string;
};

export function AvatarHolder({
  avatarId = null,
  size = 64,
  alt = "avatar",
  className = "",
  style,
  ...divProps
}: AvatarHolderProps) {
  const [url, setUrl] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const currentObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    cancelledRef.current = false;
    setUrl(null);

    if (!avatarId) {
      return () => {
        cancelledRef.current = true;
      };
    }

    (async () => {
      const media = await fetchMediaClient(String(avatarId));
      if (cancelledRef.current) return;
      if (media?.mediaEncoded) {
        // legacy: server may return base64-encoded payload
        // prefer explicit mime if available; default to png
        setUrl(`data:image/png;base64,${media.mediaEncoded}`);
      } else if (media?.url) {
        // revoke previous object URL if any
        if (currentObjectUrlRef.current) {
          try {
            URL.revokeObjectURL(currentObjectUrlRef.current);
          } catch {}
        }
        currentObjectUrlRef.current = media.url;
        setUrl(media.url);
      } else {
        setUrl(null);
      }
    })();

    return () => {
      cancelledRef.current = true;
      // cleanup object URL when unmounting
      if (currentObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(currentObjectUrlRef.current);
        } catch {}
        currentObjectUrlRef.current = null;
      }
    };
  }, [avatarId]);

  // Expose --avatar-size via inline style; allow host `style` to override.
  // Priority: size prop -> default, but user-provided `style["--avatar-size"]` wins.
  const sizeVar = { ["--avatar-size" as any]: `${size}px` };
  const mergedStyle = { ...sizeVar, ...(style || {}) } as React.CSSProperties;

  return (
    <div
      className={`${styles.avatarWrap} ${className}`.trim()}
      style={mergedStyle}
      aria-hidden={!url}
      {...divProps}
    >
      {url ? (
        <img
          src={url}
          alt={alt}
          className={styles.avatar}
          width={size}
          height={size}
          loading="lazy"
        />
      ) : (
        <div className={styles.placeholder} aria-hidden>
          <svg
            width={Math.max(24, Math.round(size * 0.6))}
            height={Math.max(24, Math.round(size * 0.6))}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            focusable="false"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="#D1D5DB" />
            <path d="M4 20a8 8 0 0116 0H4z" fill="#E5E7EB" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default AvatarHolder;
