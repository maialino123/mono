import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import type { Profile } from '@/shared/types/product';

const getProfilePath = () => {
  return path.join(process.cwd(), 'content/profile.md');
};

// Default profile when profile.md is missing or invalid
const DEFAULT_PROFILE: Profile = {
  name: 'Góc Decor của mình',
  avatar: '/default-avatar.jpg',
  bio: 'Chào mừng bạn đến với góc decor của mình!',
};

export async function getProfile(): Promise<Profile> {
  try {
    const profilePath = getProfilePath();
    const content = await fs.readFile(profilePath, 'utf-8');
    const { data, content: bio } = matter(content);

    // Validate required fields
    if (!data.name || typeof data.name !== 'string') {
      console.warn('[Profile] Missing or invalid name field, using default');
      return DEFAULT_PROFILE;
    }

    return {
      name: data.name,
      avatar: data.avatar || DEFAULT_PROFILE.avatar,
      bio: bio.trim() || DEFAULT_PROFILE.bio,
    };
  } catch (error) {
    console.error('[Profile] Failed to read profile.md:', error);
    return DEFAULT_PROFILE;
  }
}
