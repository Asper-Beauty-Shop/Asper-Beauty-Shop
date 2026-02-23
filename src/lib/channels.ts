/**
 * Dr. Rose Omnichannel Configuration
 * ====================================
 * Central configuration for all channels where Dr. Rose operates.
 * Used by the frontend, edge functions, and webhook integrations.
 */

export const SOCIAL_CHANNELS = {
  website: {
    id: 'website',
    name: 'Website Chat',
    nameAr: 'محادثة الموقع',
    url: 'https://asperbeauty.com',
    icon: 'globe',
    color: '#800020',
    enabled: true,
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameAr: 'واتساب',
    number: '962790656666',
    url: 'https://wa.me/962790656666',
    icon: 'message-circle',
    color: '#25D366',
    enabled: true,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    nameAr: 'انستغرام',
    handle: '@asper.beauty.shop',
    url: 'https://www.instagram.com/asper.beauty.shop/',
    icon: 'instagram',
    color: '#E4405F',
    enabled: true,
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    url: 'https://www.facebook.com/robu.sweileh',
    icon: 'facebook',
    color: '#1877F2',
    enabled: true,
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    handle: '@asper.beauty.shop',
    url: 'https://www.tiktok.com/@asper.beauty.shop',
    icon: 'tiktok',
    color: '#000000',
    enabled: true,
  },
  email: {
    id: 'email',
    name: 'Email',
    nameAr: 'البريد الإلكتروني',
    address: 'asperpharma@gmail.com',
    url: 'mailto:asperpharma@gmail.com',
    icon: 'mail',
    color: '#EA4335',
    enabled: true,
  },
} as const;

export type ChannelId = keyof typeof SOCIAL_CHANNELS;

export const PHONE_NUMBER = '+962790656666';
export const WHATSAPP_NUMBER = '962790656666';
export const INSTAGRAM_URL = 'https://www.instagram.com/asper.beauty.shop/';
export const FACEBOOK_URL = 'https://www.facebook.com/robu.sweileh';
export const TIKTOK_URL = 'https://www.tiktok.com/@asper.beauty.shop';
export const EMAIL_ADDRESS = 'asperpharma@gmail.com';
export const WEBSITE_URL = 'https://asperbeauty.com';

export const DR_ROSE_CHANNELS = {
  activeChannels: [
    'website',
    'whatsapp',
    'instagram',
    'facebook',
    'tiktok',
  ] as ChannelId[],
  webhookEndpoint: '/functions/v1/dr-rose-webhook',
  chatEndpoint: '/functions/v1/beauty-assistant',
} as const;
