-- Migrazione 010: crea tabella championship_season_teams
--
-- Tabella di giunzione: registra quali squadre partecipano a un dato campionato/stagione/girone.
-- Una squadra può partecipare a più campionati nella stessa stagione (es. prima squadra in Serie B
-- e squadra Under 18 nello stesso club), quindi il vincolo di unicità è su (championship_season_id, team_id).
--
-- ON DELETE RESTRICT su entrambe le FK:
--   Non si può eliminare un championship_season o un team se esistono iscrizioni attive.
--   Protezione integrità: cancellare prima le iscrizioni, poi le entità padre.

CREATE TABLE championship_season_teams (
  id                      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  championship_season_id  INT UNSIGNED  NOT NULL,
  team_id                 INT UNSIGNED  NOT NULL,
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_cst_championship_season
    FOREIGN KEY (championship_season_id) REFERENCES championship_seasons (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_cst_team
    FOREIGN KEY (team_id) REFERENCES teams (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  UNIQUE KEY uq_cst_cs_team (championship_season_id, team_id),

  INDEX idx_cst_team_id (team_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
