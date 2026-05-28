-- Seed dati per ambiente E2E (TEST-001)
-- NON usare in produzione. Hash bcrypt corrisponde alla password "E2EPass123!" (cost 12).

USE rugbytracker_test;

INSERT INTO users (username, email, password_hash, role, level, pa_score)
VALUES
  ('e2euser', 'e2e@test.local',
   '$2b$12$n51sVvTBd33FbnfW8iun/.ErF4AReO6zAPdG8UgIdWjvCtvJuyLgC',
   'user', 1, 10),
  ('e2eadmin', 'admin@test.local',
   '$2b$12$n51sVvTBd33FbnfW8iun/.ErF4AReO6zAPdG8UgIdWjvCtvJuyLgC',
   'superadmin', 4, 100);
