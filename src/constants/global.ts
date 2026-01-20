export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:3000';
export const WEBSITE_INVITE_URL = `${WEBSITE_URL}/invite/`;

export const SWAGGER_ADMIN_ACCESS_TOKEN = 'admin-access-token';
export const SWAGGER_USER_ACCESS_TOKEN = 'user-access-token';
export const SWAGGER_ADMIN_REFRESH_TOKEN = 'admin-refresh-token';
export const SWAGGER_USER_REFRESH_TOKEN = 'user-refresh-token';

// ==================== OTP ====================
export const OTP_LENGTH = 6;
export const OTP_EXPIRATION_TIME = 5; // minutes
export const DEFAULT_OTP = '111111';

// ==================== FILE UPLOADS ====================
export const MULTIPART_FORMDATA = 'multipart/form-data';
export const MAX_PROFILE_PHOTO_SIZE_MB = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_PROFILE_PHOTO_FORMATS = /image\/(jpeg|png|webp|jpg)/;

// ==================== PAGINATION ====================
export const DEFAULT_LIMIT = 10;
export const DEFAULT_PAGE = 1;
export const MAX_PAGINATION_LIMIT = 100;
export const NOTIFICATIONS_DEFAULT_LIMIT = 20;
export const NOTIFICATIONS_MAX_LIMIT = 100;

// ==================== SECURITY ====================
export const BCRYPT_SALT_ROUNDS = 10;
export const DEFAULT_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

export const DEFAULT_CURRENCY = 'NGN';
