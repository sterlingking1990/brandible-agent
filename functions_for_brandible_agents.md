# Supabase Functions for Brandible Agents

This document outlines the Supabase PostgreSQL functions used within the Brandible Agent web application.
These functions are called via Supabase RPC (Remote Procedure Call) from the application to perform specific backend logic.

---

## `finalize_purchase(p_purchase_id uuid)`

**Purpose:** To finalize a pending purchase order. This function updates the status of a purchase, assigns it to the currently authenticated agent, and records timestamps.

**Called from:** `src/app/components/PendingOrdersTable.tsx` (when the "Approve" button is clicked).

**Parameters:**
- `p_purchase_id` (uuid): The unique identifier of the purchase to be finalized.

**Returns:** `json` object indicating success or failure, along with a message.
  - `{"success": true, "message": "Purchase finalized successfully."}`
  - `{"success": false, "message": "Error message."}`

**SQL Script to Create/Replace Function:**

```sql
-- Migration: 010_create_finalize_purchase_function
-- Description: Agent approval finalizes shipment and releases escrow (coin transfer).

CREATE OR REPLACE FUNCTION public.finalize_purchase(p_purchase_id uuid)
RETURNS json AS $$
DECLARE
    v_agent_id uuid;
    v_user_type text;
    v_purchase RECORD;
    v_product RECORD;
BEGIN
    -- 1️⃣ Identify authenticated user (agent)
    SELECT auth.uid() INTO v_agent_id;
    IF v_agent_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized: no authenticated user.');
    END IF;

    -- 2️⃣ Verify the user is an agent
    SELECT user_type INTO v_user_type
    FROM public.profiles
    WHERE id = v_agent_id;

    IF v_user_type IS DISTINCT FROM 'agent' THEN
        RETURN json_build_object('success', false, 'message', 'Access denied: only agents can approve purchases.');
    END IF;

    -- 3️⃣ Fetch the purchase
    SELECT * INTO v_purchase
    FROM public.purchases
    WHERE id = p_purchase_id;

    IF v_purchase IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Purchase not found.');
    END IF;

    -- 4️⃣ Ensure purchase is shipped before approving
    IF v_purchase.status <> 'shipped' THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Purchase must be in "shipped" status before approval.'
        );
    END IF;

    -- 5️⃣ Fetch product details (for brand reference)
    SELECT * INTO v_product FROM public.products WHERE id = v_purchase.product_id;
    IF v_product IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Associated product not found.');
    END IF;

    -- 6️⃣ Transfer coins (escrow release)
    -- Deduct from buyer
    UPDATE public.profiles
    SET brandible_coins = brandible_coins - v_purchase.total_coins
    WHERE id = v_purchase.buyer_id;

    -- Credit to brand (seller)
    UPDATE public.profiles
    SET brandible_coins = brandible_coins + v_purchase.total_coins
    WHERE id = v_product.brand_id;

    -- 7️⃣ Record transactions
    INSERT INTO public.transactions (user_id, type, amount, description, reference_id, reference_type)
    VALUES (
        v_purchase.buyer_id,
        'spent',
        -v_purchase.total_coins,
        'Approved purchase of ' || v_product.name,
        p_purchase_id,
        'product_purchase'
    );

    INSERT INTO public.transactions (user_id, type, amount, description, reference_id, reference_type)
    VALUES (
        v_product.brand_id,
        'earned',
        v_purchase.total_coins,
        'Sale approved for ' || v_product.name,
        p_purchase_id,
        'product_sale'
    );

    -- 8️⃣ Mark purchase as completed
    UPDATE public.purchases
    SET
        status = 'completed',
        agent_id = v_agent_id,
        confirmed_at = now(),
        updated_at = now()
    WHERE id = p_purchase_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Purchase approved and escrow released successfully.',
        'purchase_id', p_purchase_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant RPC access to authenticated users
GRANT EXECUTE ON FUNCTION public.finalize_purchase(uuid) TO authenticated;

---

## `reject_purchase(p_purchase_id uuid, p_rejection_reason text)`

**Purpose:** To reject a pending purchase order. This function updates the status of a purchase to 'rejected', records the rejection reason, and assigns it to the currently authenticated agent.

**Called from:** `src/app/components/PendingOrdersTable.tsx` (when the "Reject" button is clicked).

**Parameters:**
- `p_purchase_id` (uuid): The unique identifier of the purchase to be rejected.
- `p_rejection_reason` (text): The reason for rejecting the purchase.

**Returns:** `json` object indicating success or failure, along with a message.
  - `{"success": true, "message": "Purchase rejected successfully."}`
  - `{"success": false, "message": "Error message."}`

**SQL Script to Create/Replace Function:**

```sql
CREATE OR REPLACE FUNCTION public.reject_purchase(p_purchase_id uuid, p_rejection_reason text)
RETURNS json AS $$
DECLARE
    v_agent_id uuid;
    v_user_type text;
    v_purchase RECORD;
BEGIN
    -- 1️⃣ Identify authenticated user
    SELECT auth.uid() INTO v_agent_id;
    IF v_agent_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized: no authenticated user.');
    END IF;

    -- 2️⃣ Verify user is an agent
    SELECT user_type INTO v_user_type
    FROM public.profiles
    WHERE id = v_agent_id;

    IF v_user_type IS DISTINCT FROM 'agent' THEN
        RETURN json_build_object('success', false, 'message', 'Access denied: only agents can reject purchases.');
    END IF;

    -- 3️⃣ Fetch the purchase
    SELECT * INTO v_purchase
    FROM public.purchases
    WHERE id = p_purchase_id;

    IF v_purchase IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Purchase not found.');
    END IF;

    -- 4️⃣ Validate current status
    IF v_purchase.status NOT IN ('pending_fulfillment', 'shipped') THEN
        RETURN json_build_object('success', false, 'message', 'Purchase not eligible for rejection. Must be pending or shipped.');
    END IF;

    -- 5️⃣ Reject purchase (no coin movement)
    UPDATE public.purchases
    SET
        status = 'rejected',
        agent_id = v_agent_id,
        rejection_reason = p_rejection_reason,
        updated_at = now(),
        confirmed_at = now()
    WHERE id = p_purchase_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Purchase rejected successfully.',
        'purchase_id', p_purchase_id,
        'rejection_reason', p_rejection_reason
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reject_purchase(uuid, text) TO authenticated;

---

## `handle_new_user_registration()`

**Purpose:** To automatically create a user profile in the `public.profiles` table when a new user signs up via Supabase Auth. It reads the `user_type` from the user's metadata or defaults to 'influencer'.

**Triggered by:** An `AFTER INSERT` trigger on the `auth.users` table.

**Parameters:** None (it's a trigger function).

**Returns:** `TRIGGER` (returns the new row).

**SQL Script to Create/Replace Function and Trigger:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    _user_type text;
    _full_name text;
    _avatar_url text;
BEGIN
    -- Get user_type from new.raw_user_meta_data, default to 'influencer' if not provided
    _user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'influencer');
    _full_name := NEW.raw_user_meta_data->>'full_name';
    _avatar_url := NEW.raw_user_meta_data->>'avatar_url';

    INSERT INTO public.profiles (id, full_name, avatar_url, user_type)
    VALUES (NEW.id, _full_name, _avatar_url, _user_type);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();
```

**Instructions for Developers:**

To ensure the application functions correctly, this SQL script must be executed in your Supabase project's SQL Editor. This will create or update the `handle_new_user_registration` function and its associated trigger, ensuring that new user profiles are created with the correct `user_type`.