import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';
import { routing } from './routing';

export default getRequestConfig(async ({ locale: override }) => {
  const param = override ?? (await rootLocale());
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Dushanbe',
  };
});
