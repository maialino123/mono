// Sample test data for seeding
export const testProducts = [
  {
    slug: 'den-led-ban-hoc',
    title: 'Đèn LED bàn học 3 chế độ sáng',
    description: 'Đèn LED mình dùng 3 tháng rồi, ánh sáng vàng ấm.',
    image: '/products/den-led.jpg',
    affiliateUrl: 'https://example.com/product/123',
    category: 'lighting' as const,
    featured: true,
  },
];

export const testProfile = {
  name: 'Test User',
  avatar: '/avatar.jpg',
  bio: 'Đây là bio test.',
};
