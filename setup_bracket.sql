-- Ejecuta este código en el SQL Editor de Supabase

-- 1. Añade las columnas de MVP para las Finales
ALTER TABLE series ADD COLUMN IF NOT EXISTS actual_mvp text;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS predicted_mvp text;

-- Toma nota de las nuevas rondas validas
ALTER TABLE series DROP CONSTRAINT IF EXISTS series_round_check;
ALTER TABLE series ADD CONSTRAINT series_round_check CHECK (round IN ('play_in', 'first_round', 'semifinals', 'conf_finals', 'finals'));

-- Y también añade el tipo de evento 'nba' a las conferencias (para la gran final)
ALTER TABLE series DROP CONSTRAINT IF EXISTS series_conference_check;
ALTER TABLE series ADD CONSTRAINT series_conference_check CHECK (conference IN ('east', 'west', 'nba'));

-- 2. Inserta las 7 rondas faltantes (Semis, Finales de Conferencia, Finales de NBA)
INSERT INTO series (
  id, round, conference, team_home, team_away, team_home_seed, team_away_seed, 
  team_home_full, team_away_full, team_home_logo, team_away_logo, team_home_color, team_away_color, status, sort_order
)
VALUES
(gen_random_uuid(), 'semifinals', 'east', 'TBD', 'TBD', 0, 0, 'Ganador E 1vs8', 'Ganador E 4vs5', '', '', '444444', '444444', 'pending', 15),
(gen_random_uuid(), 'semifinals', 'east', 'TBD', 'TBD', 0, 0, 'Ganador E 2vs7', 'Ganador E 3vs6', '', '', '444444', '444444', 'pending', 16),
(gen_random_uuid(), 'semifinals', 'west', 'TBD', 'TBD', 0, 0, 'Ganador W 1vs8', 'Ganador W 4vs5', '', '', '444444', '444444', 'pending', 17),
(gen_random_uuid(), 'semifinals', 'west', 'TBD', 'TBD', 0, 0, 'Ganador W 2vs7', 'Ganador W 3vs6', '', '', '444444', '444444', 'pending', 18),
(gen_random_uuid(), 'conf_finals', 'east', 'TBD', 'TBD', 0, 0, 'Finalista Este 1', 'Finalista Este 2', '', '', '444444', '444444', 'pending', 19),
(gen_random_uuid(), 'conf_finals', 'west', 'TBD', 'TBD', 0, 0, 'Finalista Oeste 1', 'Finalista Oeste 2', '', '', '444444', '444444', 'pending', 20),
(gen_random_uuid(), 'finals', 'nba', 'TBD', 'TBD', 0, 0, 'Campeón Este', 'Campeón Oeste', '', '', '444444', '444444', 'pending', 21);
