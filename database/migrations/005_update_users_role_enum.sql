-- Migrazione 005: aggiorna users.role da 7 valori legacy a 4 ruoli canonici
--
-- Mapping:
--   superadmin            → superadmin  (invariato)
--   moderator, editor     → superadmin  (staff piattaforma)
--   team                  → admin       (amministrazione squadra)
--   player, referee       → user_pro    (utenti premium)
--   user                  → user        (invariato)

-- Step 1: rimappa i valori esistenti prima di restringere l'ENUM
UPDATE users SET role = 'superadmin' WHERE role IN ('moderator', 'editor');
UPDATE users SET role = 'admin'      WHERE role = 'team';
UPDATE users SET role = 'user_pro'   WHERE role IN ('player', 'referee');

-- Step 2: aggiorna la definizione della colonna
ALTER TABLE users
  MODIFY COLUMN role ENUM('superadmin', 'admin', 'user_pro', 'user')
    NOT NULL DEFAULT 'user';
