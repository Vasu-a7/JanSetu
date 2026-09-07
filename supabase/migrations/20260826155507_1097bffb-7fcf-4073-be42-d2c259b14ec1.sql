-- Roles
CREATE TYPE public.app_role AS ENUM ('citizen', 'university', 'industry', 'government');
CREATE TYPE public.challenge_status AS ENUM ('open', 'assigned', 'under_review', 'active', 'resolved');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  organisation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_solver(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('university','industry','government')
  );
$$;

-- Auto-create profile + role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, organisation)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'organisation')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'citizen')::public.app_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  media_url TEXT,
  status public.challenge_status NOT NULL DEFAULT 'open',
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT SELECT ON public.challenges TO anon;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Signed in users can report challenges" ON public.challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters can update their own challenges" ON public.challenges FOR UPDATE TO authenticated USING (auth.uid() = reporter_id) WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Solvers can update challenge status" ON public.challenges FOR UPDATE TO authenticated USING (public.is_solver(auth.uid())) WITH CHECK (public.is_solver(auth.uid()));
CREATE POLICY "Reporters can delete their own challenges" ON public.challenges FOR DELETE TO authenticated USING (auth.uid() = reporter_id);
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.challenges (title, description, category, location_text, status) VALUES
('Severe Water Shortage', 'Three wards have had no piped supply for eleven days. Tankers arrive irregularly and queues start before dawn.', 'Infrastructure', 'Ward 14, Nashik', 'open'),
('Damaged Village Road', 'The approach road washed out after monsoon rain. School buses and ambulances cannot pass safely.', 'Infrastructure', 'Karjat, Raigad', 'assigned'),
('No Science Lab Equipment', 'The government secondary school has no working microscopes or chemistry glassware for 240 students.', 'Education', 'Zilla Parishad School, Beed', 'under_review'),
('Primary Health Centre Understaffed', 'One nurse serves 6,000 residents. Residents travel 40km for basic diagnostics.', 'Healthcare', 'Ambajogai Block', 'active'),
('Open Drain Near Playground', 'An uncovered storm drain beside the community playground has caused repeated injuries and mosquito breeding.', 'Sanitation', 'Sector 7, Aurangabad', 'open'),
('Frequent Power Cuts Disrupt Classes', 'Digital classrooms are unusable due to six-hour daily outages; no backup supply exists.', 'Education', 'Palghar District', 'open');