-- Optional: the app creates this database and all tables automatically (JPA ddl-auto=update).
CREATE DATABASE IF NOT EXISTS ipl_auction CHARACTER SET utf8mb4;
-- Tables created by Hibernate: players, teams, team_players (playing XI), bids, auction_results.
-- The 100 players and 4 teams are seeded on first start by com.ipl.Seeder (see player list there).
