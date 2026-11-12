import { z } from 'zod';
import { nameOk, phoneOk } from './leadRules';

/** Enquiry sent by the contact form (validated on the server; the client mirrors the basic checks). */
export const leadSchema = z.object({
  name: z.string().trim().refine(nameOk),
  phone: z.string().trim().refine(phoneOk),
  method: z.enum(['call', 'whatsapp', 'telegram']).nullable(),
  wants: z.array(z.enum(['prices', 'catalog', 'viewing', 'video'])).max(4),
  interest: z.string().max(80).nullable(),
  message: z.string().trim().max(1000),
  layouts: z.array(z.string().regex(/^[a-z0-9]{2,8}$/)).max(18),
  commercial: z.boolean(),
  calc: z
    .object({
      layout: z.string().regex(/^[a-z0-9]{2,8}$/),
      floors: z.enum(['typ', 'f9', 'ph']),
      down: z.number().int().min(0).max(100),
      term: z.number().int().min(0).max(120), // 0 = paid in full
    })
    .nullable(),
  locale: z.enum(['ru', 'tg', 'en']),
  page: z.string().max(300),
  utm: z.record(z.string().regex(/^utm_[a-z]+$/), z.string().max(120)),
  /** honeypot: real visitors leave it empty */
  company: z.string().max(200),
});

export type Lead = z.infer<typeof leadSchema>;
