-- Independence NZ Full Schema
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  address text,
  suburb text,
  city text,
  role text not null default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int default 0,
  is_active boolean default true
);
alter table public.categories enable row level security;
create policy "Anyone can view categories" on public.categories for select using (true);

insert into public.categories (name, slug, icon, sort_order) values
  ('Home Cleaning', 'cleaning', '🧹', 1),
  ('Gardening & Outdoors', 'gardening', '🌿', 2),
  ('Handyman & Maintenance', 'handyman', '🔧', 3),
  ('Fitness & Mobility', 'fitness', '🏃', 4),
  ('Personal Care', 'care', '❤️', 5),
  ('Transport & Errands', 'transport', '🚗', 6);

create table public.providers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  business_name text not null,
  bio text,
  category_id uuid references public.categories(id),
  suburb text,
  city text,
  avatar_url text,
  is_verified boolean default false,
  is_active boolean default true,
  subscription_status text default 'inactive',
  avg_rating numeric(3,2) default 0,
  total_reviews int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.providers enable row level security;
create policy "Anyone can view active providers" on public.providers for select using (is_active = true and is_verified = true);
create policy "Providers can update own" on public.providers for update using (auth.uid() = profile_id);

create table public.services (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.providers(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int default 60,
  price_cents int not null,
  is_active boolean default true
);
alter table public.services enable row level security;
create policy "Anyone can view services" on public.services for select using (is_active = true);

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.profiles(id),
  provider_id uuid references public.providers(id),
  service_id uuid references public.services(id),
  status text default 'pending',
  scheduled_date date not null,
  scheduled_time time not null,
  address text,
  notes text,
  amount_cents int not null,
  stripe_payment_intent_id text,
  payment_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.bookings enable row level security;
create policy "Customers view own bookings" on public.bookings for select using (auth.uid() = customer_id);
create policy "Customers create bookings" on public.bookings for insert with check (auth.uid() = customer_id);
create policy "Customers update own bookings" on public.bookings for update using (auth.uid() = customer_id);
create policy "Providers view their bookings" on public.bookings for select using (
  provider_id in (select id from public.providers where profile_id = auth.uid())
);

create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade unique,
  customer_id uuid references public.profiles(id),
  provider_id uuid references public.providers(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  is_published boolean default true,
  created_at timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Anyone can view reviews" on public.reviews for select using (is_published = true);
create policy "Customers create reviews" on public.reviews for insert with check (auth.uid() = customer_id);

create or replace function public.update_provider_rating()
returns trigger as $$
begin
  update public.providers set
    avg_rating = (select round(avg(rating)::numeric, 2) from public.reviews where provider_id = new.provider_id and is_published = true),
    total_reviews = (select count(*) from public.reviews where provider_id = new.provider_id and is_published = true)
  where id = new.provider_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert or update on public.reviews
  for each row execute procedure public.update_provider_rating();

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
