import Script from 'next/script';
import { ContactClickTracker } from './ContactClickTracker';

const GA = process.env.NEXT_PUBLIC_GA4_ID?.match(/^G-[A-Z0-9]{4,}$/)?.[0];
const YM = process.env.NEXT_PUBLIC_YM_ID?.match(/^\d{5,12}$/)?.[0];
const FB = process.env.NEXT_PUBLIC_META_PIXEL_ID?.match(/^\d{8,20}$/)?.[0];

/**
 * Analytics loaders — rendered only for configured IDs, after the page is interactive.
 * Whether a consent banner is required depends on the audience and is the owner's decision.
 */
export function Analytics() {
  if (!GA && !YM && !FB) return null;
  return (
    <>
      <ContactClickTracker />
      {GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}
          </Script>
        </>
      )}
      {YM && (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${YM},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
        </Script>
      )}
      {FB && (
        <Script id="fbq" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
