alter table assessments 
add column level text check (level in ('essential', 'recommended', 'advanced')) default 'advanced';
