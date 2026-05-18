CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT           NOT NULL AUTO_INCREMENT,
  user_id     INT           NOT NULL,
  token_hash  VARCHAR(64)   NOT NULL,
  expires_at  DATETIME      NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
