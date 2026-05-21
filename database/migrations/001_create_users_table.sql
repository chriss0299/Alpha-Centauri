CREATE TABLE IF NOT EXISTS users (
  id              INT             NOT NULL AUTO_INCREMENT,
  username        VARCHAR(30)     NOT NULL,
  email           VARCHAR(255)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  role            ENUM('user','player','team','referee','editor','moderator','superadmin')
                                  NOT NULL DEFAULT 'user',
  level           TINYINT         NOT NULL DEFAULT 0,
  pa_score        INT             NOT NULL DEFAULT 0,
  parental_consent  BOOLEAN       NOT NULL DEFAULT FALSE,
  guardian_managed  BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email    (email),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
