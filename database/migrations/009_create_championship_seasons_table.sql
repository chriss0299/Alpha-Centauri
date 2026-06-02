-- Migrazione 009: crea tabella championship_seasons
--
-- Collega un campionato a una stagione specifica, con eventuali suddivisioni in gruppi/gironi.
-- Esempio: "Serie B 2025/26 — Girone Nord" è una riga distinta da "Serie B 2025/26 — Girone Sud".
--
-- gruppo / girone:
--   Alcuni campionati hanno una suddivisione geografica a due livelli:
--     - gruppo  → raggruppamento macro (es. "Nord", "Centro-Sud")
--     - girone  → sotto-girone all'interno del gruppo (es. "A", "B")
--   Quando non applicabile, si usa '' (stringa vuota) invece di NULL.
--   Motivazione: MySQL considera due NULL come valori DISTINTI in un UNIQUE index,
--   rendendo impossibile bloccare duplicati su (championship_id, season_id) per
--   campionati senza gironi. Con '' il comportamento è corretto e deterministico.
--
-- UNIQUE(championship_id, season_id, gruppo, girone):
--   Impedisce di registrare due volte lo stesso campionato/stagione/girone.

CREATE TABLE championship_seasons (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  championship_id   INT UNSIGNED    NOT NULL,
  season_id         INT UNSIGNED    NOT NULL,
  gruppo            VARCHAR(100)    NOT NULL DEFAULT '',
  girone            VARCHAR(100)    NOT NULL DEFAULT '',
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_cs_championship
    FOREIGN KEY (championship_id) REFERENCES championships (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_cs_season
    FOREIGN KEY (season_id) REFERENCES seasons (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  UNIQUE KEY uq_championship_season_girone (championship_id, season_id, gruppo, girone),

  INDEX idx_cs_season_id (season_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
