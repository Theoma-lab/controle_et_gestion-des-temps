-- Exécuter ce script dans l'éditeur SQL de Supabase pour ajouter les employés manquants

INSERT INTO public.employees (email, name) VALUES
('marine@theoma.fr', 'Marine CHAILLON'),
('sandra@theoma.fr', 'Sandra EMERY'),
('regis@theoma.fr', 'Regis GODEFROY'),
('bertille@theoma.fr', 'Bertille  COURT'),
('laura@theoma.fr', 'Laura BARUK'),
('marion@theoma.fr', 'Marion  VIROLLE '),
('anais@theoma.fr', 'Anais DE JESUS'),
('arnaud@theoma.fr', 'Arnaud Guichaoua'),
('sanadati@theoma.fr', 'Sanadati RIDHOI'),
('fanny@theoma.fr', 'Fanny VIROLLET'),
('romain@theoma.fr', 'Romain GIPOULOU'),
('kassandra@theoma.fr', 'Kassandra  BRUNEAU'),
('stephanie@theoma.fr', 'Stéphanie JOLY '),
('charlotte@theoma.fr', 'Charlotte MOULINIER '),
('lise@theoma.fr', 'Lise Massei'),
('alicia@theoma.fr', 'Alicia Bejar'),
('melanie@theoma.fr', 'Mélanie Voymant')
ON CONFLICT (email) DO NOTHING;