package com.ipl;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="bids")
public class Bid {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  public Long playerId, teamId; public String teamName; public double amount; public LocalDateTime bidTime;
}
