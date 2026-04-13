
-- Add financing_type to partner_banks
CREATE TYPE public.financing_type AS ENUM ('commercial', 'islamic', 'both');

ALTER TABLE public.partner_banks
  ADD COLUMN financing_type public.financing_type NOT NULL DEFAULT 'commercial',
  ADD COLUMN description text,
  ADD COLUMN packages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN contact_email text,
  ADD COLUMN contact_phone text,
  ADD COLUMN website text;

-- Add advisor_types to agents so they can be property and/or mortgage advisors
CREATE TYPE public.advisor_type AS ENUM ('property', 'mortgage', 'both');

ALTER TABLE public.agents
  ADD COLUMN advisor_type public.advisor_type NOT NULL DEFAULT 'property',
  ADD COLUMN company_name text,
  ADD COLUMN contact_email text,
  ADD COLUMN contact_phone text,
  ADD COLUMN photo_url text;
