package com.ipl;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
interface PlayerRepo extends JpaRepository<Player,Long> { List<Player> findByStatus(String s); Optional<Player> findFirstByStatusOrderByIdAsc(String s); long countByTeamId(Long id); }
interface TeamRepo extends JpaRepository<Team,Long> {}
interface BidRepo extends JpaRepository<Bid,Long> { List<Bid> findByPlayerIdOrderByIdDesc(Long id); }
interface ResultRepo extends JpaRepository<AuctionResult,Long> { List<AuctionResult> findAllByOrderByIdDesc(); }
