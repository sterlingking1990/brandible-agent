-- Enable agents to view all YouTube ads
CREATE POLICY "Agents can view all YouTube ads" ON public.youtube_ads
FOR SELECT
USING (
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'agent'
);

-- Enable agents to update YouTube ads (for IDs)
CREATE POLICY "Agents can update YouTube ads" ON public.youtube_ads
FOR UPDATE
USING (
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'agent'
)
WITH CHECK (
  (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'agent'
);
