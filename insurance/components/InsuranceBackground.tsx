"use client";

import Image from "next/image";
import { useResponsiveBackground } from "../hooks/useResponsiveBackground";

export function InsuranceBackground() {
  const isPortraitMobile = useResponsiveBackground();
  const activeBg = isPortraitMobile ? "/insurance-bg/bg-phone.png" : "/insurance-bg/bg-laptop.png";

  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none select-none">
      <Image
        src={activeBg}
        alt="Crop Farm Background"
        fill
        priority
        quality={100}
        unoptimized
        sizes="100vw"
        className="object-cover object-center w-full h-full blur-[6px] brightness-105 scale-105"
      />
      {/* Bright, clean ambient daylight overlay */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />
    </div>
  );
}

