-- Create enums for church levels and user roles
CREATE TYPE public.church_level AS ENUM ('matriz', 'sede', 'subsede', 'congregacao', 'celula');
CREATE TYPE public.app_role AS ENUM ('super_admin', 'pastor_presidente', 'pastor', 'lider', 'membro');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  church_id UUID, -- Will reference churches table after it's created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role, church_id)
);

-- Create churches table
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia TEXT NOT NULL,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  email TEXT,
  telefone TEXT,
  pastor_presidente_id UUID REFERENCES auth.users(id),
  pastor_presidente_nome TEXT,
  nivel church_level NOT NULL,
  parent_church_id UUID REFERENCES public.churches(id),
  logo_url TEXT,
  valor_sistema DECIMAL(10,2) DEFAULT 30.00,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add foreign key to user_roles after churches table exists
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_church_id_fkey 
  FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  payment_method TEXT DEFAULT 'pix',
  status TEXT DEFAULT 'pending',
  pix_transaction_id TEXT,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Security definer function to get church IDs user can access (hierarchical)
CREATE OR REPLACE FUNCTION public.get_accessible_church_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE church_hierarchy AS (
    -- Get churches where user has a role
    SELECT c.id FROM public.churches c
    INNER JOIN public.user_roles ur ON ur.church_id = c.id
    WHERE ur.user_id = _user_id
    UNION
    -- Get all child churches
    SELECT c.id FROM public.churches c
    INNER JOIN church_hierarchy ch ON c.parent_church_id = ch.id
  )
  SELECT id FROM church_hierarchy
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_super_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Pastores can view roles in their hierarchy" ON public.user_roles
  FOR SELECT USING (
    church_id IN (SELECT public.get_accessible_church_ids(auth.uid()))
  );

-- RLS Policies for churches
CREATE POLICY "Anyone can view approved active churches" ON public.churches
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Super admins can manage all churches" ON public.churches
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Pastores can view churches in their hierarchy" ON public.churches
  FOR SELECT USING (
    id IN (SELECT public.get_accessible_church_ids(auth.uid()))
  );

CREATE POLICY "Pastores can update churches in their hierarchy" ON public.churches
  FOR UPDATE USING (
    id IN (SELECT public.get_accessible_church_ids(auth.uid()))
  );

-- RLS Policies for payments
CREATE POLICY "Super admins can manage all payments" ON public.payments
  FOR ALL USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Pastores can view payments for their churches" ON public.payments
  FOR SELECT USING (
    church_id IN (SELECT public.get_accessible_church_ids(auth.uid()))
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();