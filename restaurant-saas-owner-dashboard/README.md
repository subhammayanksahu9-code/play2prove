# RestaurantOS Owner Dashboard

This is the separate restaurant owner dashboard workspace.

## Current prototype

- All restaurants are visible by default.
- Search filters by restaurant name, area, place or domain.
- Open a restaurant to enter its tenant-specific dashboard.
- Restaurant switcher is available inside the dashboard.
- Owner sections: Overview, Orders, Menu & Products, Offers & Coupons, Website & Homepage, Customers, Delivery, Reports and Settings.
- This branch does not modify the main branch.

## Important

This is the UI/product foundation only. Supabase, Auth, RLS, real tenant data, payments, storage and production APIs are deliberately not connected yet.

The next implementation phase will convert this into the planned Next.js + Supabase multi-tenant application.
