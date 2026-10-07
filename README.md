# IPL Auction Management System
Spring Boot 3 (Java 17) + Spring Data JPA + MySQL, with a vanilla HTML/CSS/JS frontend served by the backend.

## Run
1. Install JDK 17+, Maven 3.8+, MySQL 8 (running on localhost:3306).
2. Set credentials (defaults: user `root`, password `root`):
   - Linux/Mac: `export DB_USER=root DB_PASS=yourpassword`
   - Windows (cmd): `set DB_USER=root` and `set DB_PASS=yourpassword`
   (or edit `backend/src/main/resources/application.properties`)
3. `cd backend` then `mvn spring-boot:run`
4. Open http://localhost:8080

The database `ipl_auction`, all tables, 4 teams (Rs 100 Cr purse) and 100 real players are created automatically on first start.

## Notes
- Player statistics are intentionally empty (shown as a dash): fill them from a source/season you choose via Admin > Edit player.
- Bid increment (default 0.25 Cr), team names and purse are configurable in Admin.
- All rules (squad <= 11, purse, sold-once, bid order, <= 100 players, Playing XI ownership) are enforced in `AuctionService`.
- API: /api/players, /api/teams, /api/auction/*, /api/bids, /api/analytics.
