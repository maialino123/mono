import Image from 'next/image';

interface SoraHeaderProps {
  name: string;
  tagline: string;
  avatar: string;
}

export function SoraHeader({ name, tagline, avatar }: SoraHeaderProps) {
  return (
    <header
      className="flex flex-col items-center text-center mb-12 animate-sora-fade-in-down"
      data-testid="sora-header"
    >
      <Image
        src={avatar}
        alt={name}
        width={96}
        height={96}
        className="rounded-full border-2 border-white/60 mb-4 object-cover"
      />
      <h1 className="font-playfair text-[28px] font-semibold text-white mb-2">
        {name}
      </h1>
      <p className="text-[15px] text-sora-text-secondary">
        {tagline}
      </p>
    </header>
  );
}
