"use client";
import { UserCircle } from "lucide-react";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
}

export default function Avatar({ name, src, size = 44 }: AvatarProps) {
  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "Avatar"}
        className="avatar"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: "var(--primary)",
      }}
    >
      {initials || <UserCircle size={size * 0.55} />}
    </div>
  );
}
