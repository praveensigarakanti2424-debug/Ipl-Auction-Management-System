package com.ipl;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="auction_results")
public class AuctionResult {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  public Long playerId; public String playerName, role, teamName, status; public double basePrice; public Double price; public LocalDateTime resultTime;
}
