# Brandible Agent Web Application - Version 1 Explainer

This document provides an overview of the Brandible Agent Web Application's functionality and key features implemented as of Version 1.

---

## 🚀 Application Overview

The Brandible Agent Web Application serves as the administrative interface for Brandible's internal agents. Its primary purpose is to streamline the management of order fulfillment and payment escrow processes for purchases made by micro-influencers.

---

## 🛠️ Tech Stack

-   **Framework:** Next.js (with App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS v4
-   **Backend:** Supabase (Authentication, Database, RLS, RPCs)

---

## ✨ Key Features Implemented (Version 1)

### 1. Secure Authentication System

-   **Login/Sign-up:** Agents can securely log in and create new accounts via dedicated `/login` and `/signup` pages.
-   **Email Confirmation:** A robust email confirmation flow ensures user authenticity, redirecting through `/signup/confirm` and `/auth/callback`.
-   **Supabase Client Integration:** Proper integration of Supabase client for both server-side and client-side components, ensuring secure and efficient data fetching and mutations.
-   **User Type Assignment:** During registration, the `user_type` can be specified (e.g., 'agent', 'influencer', 'brand') via `options.data` in the `supabase.auth.signUp` call. A PostgreSQL trigger function (`handle_new_user_registration`) on `auth.users` handles profile creation in `public.profiles`, defaulting to 'influencer' if `user_type` is not provided.

### 2. Pending Orders Dashboard

-   **Display Pending Orders:** Agents can view a list of pending purchase orders on the main dashboard (`/`). Orders are filtered by `status = 'shipped'`, indicating they are ready for agent review.
-   **Influencer Information:** The dashboard correctly displays the `full_name` of the micro-influencer (buyer) associated with each purchase.
-   **Approve Functionality:** Agents can approve orders, triggering the `finalize_purchase` Supabase RPC. This function updates the purchase status to 'approved' (or 'completed'), assigns the `agent_id`, and handles coin transfer/escrow release.
-   **Reject Functionality:** Agents can reject orders, triggering the `reject_purchase` Supabase RPC. This function updates the purchase status to 'rejected', records a `rejection_reason`, and assigns the `agent_id`.

### 3. Row Level Security (RLS)

-   **Agent-Specific Access:** RLS policies are configured on the `purchases` table to ensure agents only see purchases specifically assigned to them (`agent_id = auth.uid()`).
-   **Brand-Specific Access (Planned):** A separate RLS policy for brands to view purchases related to their products (`EXISTS (SELECT 1 FROM products p WHERE p.id = purchases.product_id AND p.brand_id = auth.uid())`) has been discussed and is intended for future implementation.

---

## 🚧 Current Development Status

-   All core authentication and pending order display/action functionalities are implemented and working.
-   RLS policies are in place for agents to view assigned orders.
-   The `finalize_purchase` and `reject_purchase` RPCs are defined and integrated.
-   The `handle_new_user_registration` trigger function is available for proper `user_type` assignment during signup.

---

## ➡️ Next Steps (from Development Roadmap)

-   **Agent ID Assignment:** Implement a feature for micro-influencers to choose an agent to oversee their purchases directly from the app.
-   **Advanced UI Feedback:** Improve user feedback beyond simple alerts (e.g., modals, toasts).
-   **UI Polish:** Refine the dashboard UI, add loading spinners for table data, and improve overall aesthetics.
-   **Order Details Page:** Allow agents to click an order to navigate to a detailed view.
-   **Advanced Filtering & Searching:** Add controls to filter orders by brand, influencer, or date range.
-   **Agent Activity Logging:** Create a new table to log all actions taken by agents.
