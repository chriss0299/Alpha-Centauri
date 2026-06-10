-- Migrazione 006: crea tabella teams
--
-- Rappresenta una squadra di rugby (club).
-- Una squadra può esistere nel sistema senza essere collegata a un account utente:
--   - claimed_by_user_id NULL  → squadra non ancora reclamata
--   - claimed_by_user_id SET   → utente con ruolo 'admin' che gestisce la pagina
--   - is_verified = TRUE       → verifica completata da un superadmin
--
-- Non si memorizza il livello competitivo qui: dipende dal campionato (championship_season_teams).
-- logo_url punta a storage S3-compatible; NULL finché non caricato.

CREATE TABLE teams (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name                VARCHAR(150)    NOT NULL,
  short_name          VARCHAR(20)     NOT NULL,
  city                VARCHAR(100)    NOT NULL,
  region              VARCHAR(100)    NULL,
  logo_url            VARCHAR(500)    NULL,
  is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,
  claimed_by_user_id  INT             NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- SET NULL: se l'utente viene eliminato, la squadra rimane ma diventa non reclamata
  CONSTRAINT fk_teams_claimed_by_user
    FOREIGN KEY (claimed_by_user_id) REFERENCES users (id)
    ON DELETE SET NULL  
    ON UPDATE CASCADE,

  INDEX idx_teams_claimed_by_user_id (claimed_by_user_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
