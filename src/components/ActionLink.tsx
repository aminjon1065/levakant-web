'use client';

import type { ReactNode } from 'react';
import { askCom, askVideo, goWA } from '@/lib/actions';

const ACTIONS = { askVideo, goWA, askCom };

/** An anchor that runs a page action on click (keeps server-rendered sections free of handlers). */
export function ActionLink({
  action,
  className,
  href,
  children,
  ...rest
}: {
  action: keyof typeof ACTIONS;
  className?: string;
  href: string;
  children: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <a className={className} href={href} onClick={ACTIONS[action]} {...rest}>
      {children}
    </a>
  );
}
