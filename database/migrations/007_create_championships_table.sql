-- Migrazione 007: crea tabella championships
--
-- Un campionato è un'entità stabile nel tempo (es. "Serie B FIR", "Under 18 Regionale Lazio").
-- NON contiene date o stagioni: quelle vivono in championship_seasons (migrazione 009).
--
-- level: rispecchia la gerarchia FIR e i livelli giovanili definiti nel PRD §3.
--   - serie_a_elite / serie_a / serie_b / serie_c → campionati nazionali/interregionali adulti
--   - under_18 → under_6                          → settori giovanili
--   - regional                                    → tornei regionali non classificati
--   - other                                       → catch-all per edge case
--
-- region NULL → campionato nazionale (es. Serie A Elite).
-- region SET  → campionato regionale/interregionale (es. "Lazio", "Lombardia").

CREATE TABLE championships (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200)  NOT NULL,
  short_name  VARCHAR(50)   NULL,
  level       ENUM(
                'serie_a_elite',
                'serie_a',
                'serie_b',
                'serie_c',
                'under_18',
                'under_16',
                'under_14',
                'under_12',
                'under_10',
                'under_8',
                'under_6',
                'regional',
                'other'
              )             NOT NULL,
  region      VARCHAR(100)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  INDEX idx_championships_level (level)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
