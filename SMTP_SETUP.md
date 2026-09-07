# Brevo Custom SMTP Configuration Guide for Supabase Auth

This guide provides step-by-step instructions to configure **Brevo (formerly Sendinblue) Custom SMTP** in your Supabase Auth dashboard for sending signup email confirmations and password reset emails for **JanSetu Civic Commons**.

---

## 🔒 Security & Privacy Notice

> [!IMPORTANT]
> - **Zero Plain-Text Credentials**: Never commit real SMTP keys, passwords, or secrets to Git or store them in public files.
> - **Placeholders Used**: All examples below use standard security placeholders (`BREVO_SMTP_USERNAME`, `BREVO_SMTP_KEY`, `VERIFIED_SENDER_EMAIL`). Replace them with your actual values **only** inside the private Supabase Dashboard interface.

---

## 1. Brevo Account & Sender Setup

### Step 1.1: Create & Verify Brevo Account
1. Log in to [Brevo Console](https://app.brevo.com/).
2. Navigate to **Senders & IP** under your Account Settings.
3. Click **Add a Sender**:
   - **Sender Name**: `JanSetu Civic Commons`
   - **Sender Email**: `VERIFIED_SENDER_EMAIL` (e.g. `admin@jansetu.org` or your verified email)
4. Check your email inbox and click the verification link sent by Brevo.

### Step 1.2: Obtain Brevo SMTP Credentials
1. In the Brevo dashboard, navigate to **SMTP & API Key Settings** (`Transactional` -> `SMTP & API`).
2. Select the **SMTP** tab.
3. Note your SMTP details:
   - **SMTP Server / Host**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login / Username**: `BREVO_SMTP_USERNAME` (Your verified Brevo account email)
4. Click **Generate a new SMTP key**:
   - Key Name: `JanSetu Supabase Production SMTP`
   - Click **Generate**.
5. Copy the generated key (`BREVO_SMTP_KEY`). *Keep this key safe; Brevo will not display it again.*

---

## 2. Supabase Dashboard SMTP Configuration

### Step 2.1: Navigate to Auth Settings
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your existing **JanSetu** project.
3. In the left sidebar, navigate to **Project Settings** -> **Authentication** (or **Authentication** -> **Providers** -> **Email**).

### Step 2.2: Enable Custom SMTP Server
Scroll down to the **SMTP Settings** section and toggle **Enable Custom SMTP**:

| Field Name | Exact Configuration Value |
| :--- | :--- |
| **Sender Email** | `VERIFIED_SENDER_EMAIL` |
| **Sender Name** | `JanSetu Civic Commons` |
| **Host** | `smtp-relay.brevo.com` |
| **Port** | `587` |
| **Minimum Encryption** | `TLS` / `STARTTLS` |
| **Username** | `BREVO_SMTP_USERNAME` |
| **Password** | `BREVO_SMTP_KEY` |

Click **Save** at the bottom of the page.

---

## 3. Email Templates & Confirmation Settings

### Step 3.1: Enable Signup Email Confirmations
1. In Supabase Dashboard, navigate to **Authentication** -> **URL Configuration** / **Email Templates**.
2. Under **User Signups**, ensure **Confirm Email** is enabled (Toggled ON).
3. Set **Site URL**: `https://<your-domain>.vercel.app` (or `http://localhost:3000` for local dev).
4. Under **Redirect URLs**, add:
   - `https://<your-domain>.vercel.app/auth`
   - `https://<your-domain>.vercel.app/auth?mode=reset`
   - `http://localhost:3000/auth`
   - `http://localhost:3000/auth?mode=reset`

### Step 3.2: Verify Password Reset Template
1. Under **Email Templates** -> **Reset Password**, confirm the action URL contains `{{ .RedirectTo }}`.
2. The reset password email will be dispatched through Brevo SMTP when a user clicks **Forgot Password** on JanSetu.

---

## 4. Verification & Testing Checklist

Execute the following verification checklist after applying your SMTP credentials in the Supabase Dashboard:

- [ ] **1. Signup Confirmation Email**:
  - Register a new account on JanSetu (`/auth?mode=signup`) using a valid `@gmail.com` address.
  - Verify that a confirmation email arrives in the recipient inbox sent by `JanSetu Civic Commons <VERIFIED_SENDER_EMAIL>` via Brevo (`smtp-relay.brevo.com`).
- [ ] **2. Forgot Password Email**:
  - Click **Forgot Password** on `/auth` and submit your email.
  - Verify that the password reset link is delivered through Brevo and redirects properly to `/auth?mode=reset`.
- [ ] **3. Non-Gmail Restriction Enforcement**:
  - Attempt to sign up with a non-Gmail address (e.g. `test@yahoo.com` or `user@outlook.com`).
  - Verify that registration is blocked with the error: `"Only trusted Gmail addresses ending in @gmail.com can be used to create an account."`
- [ ] **4. Database Trigger Verification (`public.user_data`)**:
  - Check Supabase SQL Editor / Table Editor for `public.user_data`.
  - Confirm that newly registered user details (`id`, `full_name`, `email`, `organisation`, `role`) are inserted automatically via the `handle_new_user()` trigger.
- [ ] **5. Report Filing Verification (`public.reported_data`)**:
  - Log in and submit a civic complaint on `/report`.
  - Confirm the report record is saved directly to `public.reported_data`.
- [ ] **6. Password Storage Security Audit**:
  - Inspect `public.user_data`, `public.profiles`, and `public.reported_data`.
  - Confirm that **no plain-text passwords or hashes** are stored in these application tables. Passwords remain encrypted inside Supabase `auth.users`.

---

## ⚠️ Security Warnings

> [!CAUTION]
> 1. **Do Not Use Account Login Password**: Always use the generated Brevo **SMTP Key**, not your Brevo account password.
> 2. **Environment Variables**: If testing locally, keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Never expose service-role keys or Brevo SMTP keys in client-side `.env` files.

