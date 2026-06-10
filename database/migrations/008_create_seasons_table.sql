-- Migrazione 008: crea tabella seasons
--
-- Una stagione sportiva (es. "2025/26").
-- È un'entità indipendente: la stessa stagione è condivisa da tutti i campionati.
--
-- name: stringa human-readable in formato "YYYY/YY" (es. "2025/26", "2024/25").
-- start_date / end_date: date effettive della stagione sportiva FIR.
-- is_current: flag per identificare la stagione attiva senza query complesse.
--   Invariante applicativa: al massimo una riga con is_current = TRUE.
--   Non imposto UNIQUE qui (MySQL non supporta partial unique index su BOOLEAN),
--   ma l'applicazione deve garantire questo vincolo in fase di INSERT/UPDATE.

CREATE TABLE seasons (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(10)   NOT NULL,
  start_date  DATE          NOT NULL,
  end_date    DATE          NOT NULL,
  is_current  BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  UNIQUE KEY uq_seasons_name (name)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
