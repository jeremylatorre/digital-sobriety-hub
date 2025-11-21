create table assessments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  project_name text not null,
  project_description text,
  responses jsonb,
  score jsonb,
  status text check (status in ('draft', 'completed')),
  referential_id text
);

alter table assessments enable row level security;

create policy "Users can view their own assessments"
  on assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assessments"
  on assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assessments"
  on assessments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own assessments"
  on assessments for delete
  using (auth.uid() = user_id);
