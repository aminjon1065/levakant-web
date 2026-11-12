import type { CSSProperties } from 'react';
import { useLocale } from 'next-intl';
import { SiteProvider } from '@/components/SiteProvider';
import { About } from '@/components/sections/About';
import { Apartments } from '@/components/sections/Apartments';
import { Architecture } from '@/components/sections/Architecture';
import { Building } from '@/components/sections/Building';
import { Commerce } from '@/components/sections/Commerce';
import { Contact } from '@/components/sections/Contact';
import { Floorplan } from '@/components/sections/Floorplan';
import { Footer } from '@/components/sections/Footer';
import { Gallery } from '@/components/sections/Gallery';
import { Hero } from '@/components/sections/Hero';
import { Lifestyle } from '@/components/sections/Lifestyle';
import { Lightbox } from '@/components/sections/Lightbox';
import { Location } from '@/components/sections/Location';
import { MobileCta } from '@/components/sections/MobileCta';
import { Nav } from '@/components/sections/Nav';
import { PlanZoom } from '@/components/sections/PlanZoom';
import { Price } from '@/components/sections/Price';
import { Trust } from '@/components/sections/Trust';
import { getSiteData, hasDemo } from '@/lib/data';
import { nf } from '@/lib/format';
import { allMin } from '@/lib/pricing';

/** The one-page site. Section order and anchors follow the approved mockup. */
export default function Page() {
  const locale = useLocale();
  const { d, pricing, site } = getSiteData(locale);
  const pxFrom = nf(locale, allMin(d, pricing));
  return (
    <SiteProvider d={d} pricing={pricing} site={site} locale={locale}>
      <div className="lr" id="lr-root" lang={locale} style={{ '--gold': '#C9A46A' } as CSSProperties}>
        <Nav />
        <Hero pxFrom={pxFrom} />
        <div className="rest">
          <About pxFrom={pxFrom} />
          <Price />
          <Building />
          <Floorplan />
          <Apartments />
          <Trust />
          <Lifestyle />
          <Location />
          <Gallery />
          <Architecture />
          <Commerce />
          <Contact />
          <Footer demo={hasDemo()} site={site} />
          <MobileCta />
        </div>
        <Lightbox />
        <PlanZoom />
      </div>
    </SiteProvider>
  );
}
