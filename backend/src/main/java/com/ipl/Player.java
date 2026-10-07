package com.ipl;
import jakarta.persistence.*;
@Entity @Table(name="players")
public class Player {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @Column(nullable=false) public String name;
  public String country; public boolean overseas; public Integer age;
  public String role, playingOrder, battingStyle, bowlingStyle;
  public Integer matches, runs, fifties, hundreds, wickets;
  public Double battingAvg, strikeRate, bowlingAvg, economy, bowlingSR;
  public double basePrice; public String imageUrl;
  public String status="AVAILABLE";
  @ManyToOne public Team team; public Double soldPrice;
}
