package com.ipl;
import jakarta.persistence.*;
import java.util.*;
@Entity @Table(name="teams")
public class Team {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
  @Column(nullable=false) public String name; public String logo;
  public double initialPurse, purse; public int maxSquad=11;
  @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="team_players") public List<Long> playingXi=new ArrayList<>();
  @Transient public int playerCount;
}
