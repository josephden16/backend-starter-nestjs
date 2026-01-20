const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = () => ({
  port: parseInt(`${process.env.PORT}`, 10) || 7100,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  },
  notifications: {
    retentionDays: parseNumber(
      process.env.FIREBASE_NOTIFICATIONS_RETENTION_DAYS,
      90,
    ),
  },
});

export enum MailServiceEnum {
  RESEND = 'resend',
  SMTP = 'smtp',
}
