"use client";

import Image from 'next/image';
import { useState } from 'react';
import { GlassCard } from '@/shared/ui/glass-card';
import type { Profile } from '@/entities/profile';

interface ProfileHeroProps {
  profile: Profile;
}

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <span className="text-white text-2xl font-bold">{initials}</span>
    </div>
  );
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <GlassCard className="w-full">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-white/30">
          {imageError ? (
            <AvatarPlaceholder name={profile.name} />
          ) : (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
              priority
            />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {profile.name}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-3">
            {profile.bio}
          </p>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span>⭐ Review chân thực</span>
            <span>•</span>
            <span>Không quảng cáo</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
