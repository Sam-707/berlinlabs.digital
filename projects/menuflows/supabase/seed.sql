-- ============================================================
-- MenuFlows — Complete Schema + Demo Data
-- Berlin Labs Digital · berlinlabs.digital
--
-- Run this once in your Supabase SQL Editor after creating a new project.
-- It creates all tables, sets up RLS policies, and loads a demo restaurant
-- so you can test the full flow immediately.
--
-- Demo URL:    your-deployment.vercel.app/demo
-- Owner PIN:   1234
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Restaurants (one row per restaurant deployment)
create table if not exists restaurants (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  name                text not null,
  business_type       text not null default 'restaurant',
  logo_url            text not null default '',
  accent_color        text not null default '#c21e3a',
  cover_image_url     text,
  email               text,
  phone               text,
  city                text,
  country             text not null default 'DE',
  is_open             boolean not null default true,
  currency            text not null default 'EUR',
  google_review_url   text,
  owner_pin_hash      text not null default encode(sha256('1234'::bytea), 'hex'),
  subscription_plan   text not null default 'pro',
  subscription_status text not null default 'active',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Menu items
create table if not exists menu_items (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid not null references restaurants(id) on delete cascade,
  name            text not null,
  translated_name text,
  description     text not null default '',
  price           numeric(10,2) not null default 0,
  image_url       text not null default '',
  category        text not null default 'Mains',
  is_available    boolean not null default true,
  is_spicy        boolean default false,
  contains_peanuts boolean default false,
  allergens       text[] not null default '{}',
  additives       text[] not null default '{}',
  display_order   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Modifier groups (e.g. "Size", "Extras", "Sauce")
create table if not exists modifier_groups (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid not null references restaurants(id) on delete cascade,
  name            text not null,
  name_translated text,
  min_selections  integer not null default 0,
  max_selections  integer not null default 1,
  is_required     boolean not null default false,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Modifier options (e.g. "Large +€1.50", "Extra Cheese +€0.80")
create table if not exists modifiers (
  id               uuid primary key default uuid_generate_v4(),
  group_id         uuid not null references modifier_groups(id) on delete cascade,
  name             text not null,
  name_translated  text,
  price_adjustment numeric(10,2) not null default 0,
  is_available     boolean not null default true,
  is_default       boolean not null default false,
  display_order    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Menu item ↔ modifier group junction
create table if not exists menu_item_modifiers (
  menu_item_id      uuid not null references menu_items(id) on delete cascade,
  modifier_group_id uuid not null references modifier_groups(id) on delete cascade,
  created_at        timestamptz not null default now(),
  primary key (menu_item_id, modifier_group_id)
);

-- Orders
create table if not exists orders (
  id            uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_number  text,
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cooking', 'ready', 'served')),
  confirmed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Order items
create table if not exists order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id) on delete cascade,
  menu_item_id    uuid not null references menu_items(id),
  quantity        integer not null default 1,
  notes           text,
  modifiers       jsonb not null default '[]',   -- array of DbSelectedModifier
  modifiers_total numeric(10,2) not null default 0,
  unit_price      numeric(10,2) not null default 0,
  created_at      timestamptz not null default now()
);

-- Platform admins (Berlin Labs internal — not visible to restaurant owners)
create table if not exists platform_admins (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  name          text not null,
  password_hash text not null,
  role          text not null default 'support'
                check (role in ('super_admin', 'support', 'viewer')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_menu_items_restaurant on menu_items(restaurant_id);
create index if not exists idx_menu_items_category on menu_items(restaurant_id, category);
create index if not exists idx_orders_restaurant on orders(restaurant_id);
create index if not exists idx_orders_status on orders(restaurant_id, status);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_modifier_groups_restaurant on modifier_groups(restaurant_id);
create index if not exists idx_modifiers_group on modifiers(group_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger restaurants_updated_at
  before update on restaurants
  for each row execute function set_updated_at();

create or replace trigger menu_items_updated_at
  before update on menu_items
  for each row execute function set_updated_at();

create or replace trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table restaurants      enable row level security;
alter table menu_items       enable row level security;
alter table modifier_groups  enable row level security;
alter table modifiers        enable row level security;
alter table menu_item_modifiers enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table platform_admins  enable row level security;

-- Restaurants: public read (needed for slug lookup on load)
create policy "Public read restaurants"
  on restaurants for select to anon, authenticated using (true);

-- Menu items: public read, no public write (owner ops go through Edge Function)
create policy "Public read menu_items"
  on menu_items for select to anon, authenticated using (true);

-- Modifier groups + modifiers: public read
create policy "Public read modifier_groups"
  on modifier_groups for select to anon, authenticated using (true);

create policy "Public read modifiers"
  on modifiers for select to anon, authenticated using (true);

create policy "Public read menu_item_modifiers"
  on menu_item_modifiers for select to anon, authenticated using (true);

-- Orders: public insert (customers place orders), public read (status tracking)
create policy "Public insert orders"
  on orders for insert to anon, authenticated with check (true);

create policy "Public read orders"
  on orders for select to anon, authenticated using (true);

create policy "Public update order status"
  on orders for update to anon, authenticated using (true) with check (true);

-- Order items: public insert + read
create policy "Public insert order_items"
  on order_items for insert to anon, authenticated with check (true);

create policy "Public read order_items"
  on order_items for select to anon, authenticated using (true);

-- Platform admins: no public access
create policy "No public access to platform_admins"
  on platform_admins for all to anon using (false);

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime on orders so kitchen view updates live
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table menu_items;

-- ============================================================
-- DEMO DATA — Single restaurant "demo"
-- ============================================================

do $$
declare
  r_id uuid;
  g_size uuid;
  g_extras uuid;
  item_burger uuid;
  item_pizza uuid;
begin

-- Restaurant
insert into restaurants (id, slug, name, accent_color, is_open, currency, country, owner_pin_hash)
values (
  uuid_generate_v4(),
  'demo',
  'Sample Bistro',
  '#c21e3a',
  true,
  'EUR',
  'DE',
  encode(sha256('1234'::bytea), 'hex')
)
on conflict (slug) do nothing
returning id into r_id;

-- If the restaurant already existed, get its id
if r_id is null then
  select id into r_id from restaurants where slug = 'demo';
end if;

-- Modifier group: Size
insert into modifier_groups (id, restaurant_id, name, min_selections, max_selections, is_required, display_order)
values (uuid_generate_v4(), r_id, 'Size', 1, 1, true, 1)
returning id into g_size;

insert into modifiers (group_id, name, price_adjustment, is_default, display_order)
values
  (g_size, 'Regular',  0.00, true,  1),
  (g_size, 'Large',    2.00, false, 2);

-- Modifier group: Extras
insert into modifier_groups (id, restaurant_id, name, min_selections, max_selections, is_required, display_order)
values (uuid_generate_v4(), r_id, 'Extras', 0, 3, false, 2)
returning id into g_extras;

insert into modifiers (group_id, name, price_adjustment, is_default, display_order)
values
  (g_extras, 'Extra Cheese',   1.00, false, 1),
  (g_extras, 'Bacon',          1.50, false, 2),
  (g_extras, 'Jalapeños',      0.50, false, 3);

-- Menu items
insert into menu_items (id, restaurant_id, name, translated_name, description, price, image_url, category, is_available, is_spicy, display_order)
values (
  uuid_generate_v4(), r_id,
  'Classic Burger', 'Klassischer Burger',
  'Beef patty, lettuce, tomato, house sauce, brioche bun.',
  12.90,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  'Burgers', true, false, 1
)
returning id into item_burger;

insert into menu_items (id, restaurant_id, name, translated_name, description, price, image_url, category, is_available, is_spicy, display_order)
values (
  uuid_generate_v4(), r_id,
  'Margherita Pizza', 'Margherita Pizza',
  'San Marzano tomato, buffalo mozzarella, fresh basil.',
  14.50,
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
  'Pizza', true, false, 1
)
returning id into item_pizza;

insert into menu_items (restaurant_id, name, translated_name, description, price, image_url, category, is_available, is_spicy, display_order)
values
  (r_id, 'Caesar Salad', 'Caesar Salat', 'Romaine, parmesan, croutons, house Caesar dressing.', 9.90, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80', 'Salads', true, false, 1),
  (r_id, 'Truffle Fries', 'Trüffelchips', 'Crispy fries, truffle oil, parmesan, fresh herbs.', 6.50, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80', 'Sides', true, false, 1),
  (r_id, 'Sparkling Water', 'Mineralwasser', '500ml, still or sparkling.', 2.50, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', 'Drinks', true, false, 1),
  (r_id, 'Craft Lager', 'Lagerbier', 'Local craft beer, 330ml bottle.', 4.50, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80', 'Drinks', true, false, 2),
  (r_id, 'Chocolate Lava Cake', 'Schoko-Lava-Kuchen', 'Warm chocolate cake, vanilla ice cream.', 7.90, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', 'Desserts', true, false, 1);

-- Link burger to Size + Extras modifier groups
insert into menu_item_modifiers (menu_item_id, modifier_group_id)
values
  (item_burger, g_size),
  (item_burger, g_extras);

-- Link pizza to Size modifier group only
insert into menu_item_modifiers (menu_item_id, modifier_group_id)
values
  (item_pizza, g_size);

end $$;

-- ============================================================
-- VERIFY
-- ============================================================
--
-- After running, check these in SQL Editor:
--
-- select slug, name, is_open from restaurants;
-- → should show: demo | Sample Bistro | true
--
-- select name, category, price from menu_items order by category, display_order;
-- → should show 7 items across Burgers, Pizza, Salads, Sides, Drinks, Desserts
--
-- Then open: your-deployment.vercel.app/demo
-- Owner PIN: 1234
--
-- ============================================================
