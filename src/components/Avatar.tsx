"use client";
import Image from "next/image";
import { UserCircle } from "lucide-react";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  priority?: boolean;
}

export default function Avatar({ name, src, size = 44, priority = false }: AvatarProps) {

  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div className="avatar" style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          style={{ objectFit: 'cover' }}
          sizes={`${size}px`}
          priority={priority}
        />

      </div>
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
