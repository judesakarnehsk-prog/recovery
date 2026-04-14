-- ============================================================
-- Revorva — Migration 001: Add new user profile fields
-- Run this in your Supabase SQL Editor AFTER the initial schema
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Add new columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS business_category text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth date;

-- 2. Update the handle_new_user() trigger to capture signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, company_name, company_url, business_category, country)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce(new.raw_user_meta_data->>'company_name', null),
    coalesce(new.raw_user_meta_data->>'company_url', null),
    coalesce(new.raw_user_meta_data->>'business_category', null),
    coalesce(new.raw_user_meta_data->>'country', null)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users(country);
CREATE INDEX IF NOT EXISTS idx_users_business_category ON public.users(business_category);
