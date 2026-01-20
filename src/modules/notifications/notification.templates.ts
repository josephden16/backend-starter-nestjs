export type NotificationTemplateContext = Record<string, unknown>;

type TemplateValue =
  | string
  | ((context: NotificationTemplateContext) => string | undefined);

type TemplateDataBuilder =
  | ((
      context: NotificationTemplateContext,
    ) => Record<string, unknown> | undefined)
  | undefined;

export interface NotificationTemplateDefinition {
  key: NotificationTemplateKey;
  title: TemplateValue;
  body: TemplateValue;
  icon?: string;
  ctaLabel?: TemplateValue;
  ctaDeepLink?: TemplateValue;
  dataBuilder?: TemplateDataBuilder;
}

export interface NotificationContentPayload {
  title: string;
  body: string;
  icon?: string;
  ctaLabel?: string;
  ctaDeepLink?: string;
  data?: Record<string, unknown>;
}

export enum NotificationTemplateKey {
  Welcome = 'WELCOME',
}

const notificationTemplates: Record<
  NotificationTemplateKey,
  NotificationTemplateDefinition
> = {
  [NotificationTemplateKey.Welcome]: {
    key: NotificationTemplateKey.Welcome,
    title: (ctx) => `Welcome, ${ctx.firstName ?? 'friend'}!`,
    body: () =>
      'You are all set. Complete your profile to get started.',
    icon: 'badge-check',
    ctaLabel: 'Complete profile',
    ctaDeepLink: 'app://profile/setup',
  },
};

const renderValue = (
  value: TemplateValue | undefined,
  context: NotificationTemplateContext,
): string | undefined => {
  if (typeof value === 'function') {
    return value(context) ?? undefined;
  }
  return value;
};

export const resolveNotificationTemplate = (
  key: NotificationTemplateKey,
  context: NotificationTemplateContext = {},
): NotificationContentPayload => {
  const template = notificationTemplates[key];

  if (!template) {
    throw new Error(`Notification template ${key} is not defined`);
  }

  const title = renderValue(template.title, context) ?? '';
  const body = renderValue(template.body, context) ?? '';
  const icon = renderValue(template.icon, context);
  const ctaLabel = renderValue(template.ctaLabel, context);
  const ctaDeepLink = renderValue(template.ctaDeepLink, context);
  const data = template.dataBuilder?.(context);

  return {
    title,
    body,
    icon,
    ctaLabel,
    ctaDeepLink,
    data,
  };
};
