package com.ipl;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuctionService {
  private final PlayerRepo players; private final TeamRepo teams; private final BidRepo bids; private final ResultRepo results;
  private String status="IDLE"; private Long currentId, highTeam; private double currentBid=0, increment=0.25;
  private final Set<Long> passed=new HashSet<>();
  static final Set<String> ROLES=Set.of("BATSMAN","BOWLER","ALL-ROUNDER","WICKET-KEEPER");

  public AuctionService(PlayerRepo p, TeamRepo t, BidRepo b, ResultRepo r){ players=p; teams=t; bids=b; results=r; }
  static double r2(double v){ return Math.round(v*100.0)/100.0; }
  static ApiException err(HttpStatus s,String m){ return new ApiException(s,m); }

  // ---------- players ----------
  public List<Player> listPlayers(String st,String role){
    return players.findAll().stream().sorted(Comparator.comparing((Player p)->p.id))
      .filter(p->st==null||st.isBlank()||st.equalsIgnoreCase(p.status))
      .filter(p->role==null||role.isBlank()||role.equalsIgnoreCase(p.role)).collect(Collectors.toList());
  }
  public Player player(Long id){ return players.findById(id).orElseThrow(()->err(HttpStatus.NOT_FOUND,"Player not found")); }
  private void copy(Player s,Player d){
    if(s.name==null||s.name.isBlank()) throw err(HttpStatus.BAD_REQUEST,"Player name is required");
    if(s.role==null||!ROLES.contains(s.role)) throw err(HttpStatus.BAD_REQUEST,"Invalid role");
    if(s.basePrice<=0) throw err(HttpStatus.BAD_REQUEST,"Base price must be greater than 0");
    d.name=s.name.trim(); d.country=s.country==null||s.country.isBlank()?"India":s.country.trim();
    d.overseas=!d.country.equalsIgnoreCase("India"); d.age=s.age; d.role=s.role; d.playingOrder=s.playingOrder;
    d.battingStyle=s.battingStyle; d.bowlingStyle=s.bowlingStyle; d.matches=s.matches; d.runs=s.runs; d.fifties=s.fifties;
    d.hundreds=s.hundreds; d.wickets=s.wickets; d.battingAvg=s.battingAvg; d.strikeRate=s.strikeRate; d.bowlingAvg=s.bowlingAvg;
    d.economy=s.economy; d.bowlingSR=s.bowlingSR; d.basePrice=s.basePrice; d.imageUrl=s.imageUrl;
  }
  public Player createPlayer(Player in){
    if(players.count()>=100) throw err(HttpStatus.BAD_REQUEST,"Maximum 100 players allowed");
    Player p=new Player(); copy(in,p); p.status="AVAILABLE"; return players.save(p);
  }
  public Player updatePlayer(Long id,Player in){ Player p=player(id); copy(in,p); return players.save(p); }
  public void deletePlayer(Long id){
    Player p=player(id);
    if("SOLD".equals(p.status)) throw err(HttpStatus.CONFLICT,"A sold player cannot be removed");
    if(id.equals(currentId)) throw err(HttpStatus.CONFLICT,"Player is currently on the block");
    players.delete(p);
  }

  // ---------- teams ----------
  public Team team(Long id){ return teams.findById(id).orElseThrow(()->err(HttpStatus.NOT_FOUND,"Team not found")); }
  private Team withCount(Team t){ t.playerCount=(int)players.countByTeamId(t.id); return t; }
  public Team teamView(Long id){ return withCount(team(id)); }
  public List<Team> allTeams(){ return teams.findAll().stream().sorted(Comparator.comparing((Team t)->t.id)).map(this::withCount).collect(Collectors.toList()); }
  public Team updateTeam(Long id,Map<String,Object> b){
    Team t=team(id);
    if(b.get("name") instanceof String n && !n.isBlank()) t.name=n.trim();
    if(b.get("logo") instanceof String l) t.logo=l;
    if(b.get("initialPurse") instanceof Number n){
      double spent=players.findAll().stream().filter(p->p.team!=null&&p.team.id.equals(id)&&p.soldPrice!=null).mapToDouble(p->p.soldPrice).sum();
      double np=n.doubleValue(); if(np-spent<0) throw err(HttpStatus.BAD_REQUEST,"Purse is lower than amount already spent");
      t.initialPurse=np; t.purse=r2(np-spent);
    }
    return withCount(teams.save(t));
  }
  public Team setXi(Long id,List<Long> ids){
    Team t=team(id);
    if(new HashSet<>(ids).size()!=ids.size()||ids.size()>11) throw err(HttpStatus.BAD_REQUEST,"Select up to 11 distinct players");
    for(Long pid: ids){ Player p=player(pid);
      if(p.team==null||!p.team.id.equals(id)) throw err(HttpStatus.BAD_REQUEST,p.name+" does not belong to "+t.name); }
    t.playingXi.clear(); t.playingXi.addAll(ids); return withCount(teams.save(t));
  }

  // ---------- auction ----------
  private Double nextBid(Player p){ return highTeam==null?p.basePrice:r2(currentBid+increment); }
  public synchronized Map<String,Object> state(){
    Map<String,Object> m=new LinkedHashMap<>();
    Player p=currentId==null?null:players.findById(currentId).orElse(null);
    m.put("status",status); m.put("increment",increment); m.put("player",p); m.put("currentBid",currentBid);
    m.put("nextBid",p==null?null:nextBid(p)); m.put("highestTeamId",highTeam); m.put("passed",new ArrayList<>(passed));
    m.put("teams",allTeams()); m.put("bids",p==null?List.of():bids.findByPlayerIdOrderByIdDesc(p.id));
    return m;
  }
  private void pick(){
    passed.clear(); highTeam=null; currentBid=0;
    Optional<Player> n=players.findFirstByStatusOrderByIdAsc("AVAILABLE");
    if(n.isPresent()) currentId=n.get().id; else { currentId=null; status="COMPLETED"; }
  }
  public synchronized Map<String,Object> start(){
    if(status.equals("IDLE")||status.equals("COMPLETED")) status="RUNNING";
    if(currentId==null&&status.equals("RUNNING")) pick();
    return state();
  }
  public synchronized Map<String,Object> next(){
    if(status.equals("IDLE")) throw err(HttpStatus.BAD_REQUEST,"Start the auction first");
    if(status.equals("PAUSED")) throw err(HttpStatus.CONFLICT,"Auction is paused");
    if(currentId!=null) throw err(HttpStatus.CONFLICT,"Mark the current player SOLD or UNSOLD first");
    status="RUNNING"; pick(); return state();
  }
  public synchronized Map<String,Object> pause(){
    if(!status.equals("RUNNING")) throw err(HttpStatus.CONFLICT,"Auction is not running"); status="PAUSED"; return state(); }
  public synchronized Map<String,Object> resume(){
    if(!status.equals("PAUSED")) throw err(HttpStatus.CONFLICT,"Auction is not paused"); status="RUNNING"; return state(); }
  public synchronized Map<String,Object> setIncrement(double v){
    if(v<=0) throw err(HttpStatus.BAD_REQUEST,"Increment must be positive"); increment=r2(v); return state(); }
  private Player live(){
    if(!status.equals("RUNNING")) throw err(HttpStatus.CONFLICT,"Auction is not running");
    if(currentId==null) throw err(HttpStatus.CONFLICT,"No player is on the block");
    Player p=player(currentId);
    if(!"AVAILABLE".equals(p.status)) throw err(HttpStatus.CONFLICT,"This player has already been sold");
    return p;
  }
  public synchronized Map<String,Object> bid(Long teamId){
    Player p=live(); Team t=team(teamId);
    if(players.countByTeamId(t.id)>=t.maxSquad) throw err(HttpStatus.CONFLICT,"Team already has "+t.maxSquad+" players");
    if(passed.contains(t.id)) throw err(HttpStatus.CONFLICT,t.name+" has passed on this player");
    if(t.id.equals(highTeam)) throw err(HttpStatus.CONFLICT,t.name+" already holds the highest bid");
    double amt=nextBid(p);
    if(t.purse<amt) throw err(HttpStatus.CONFLICT,"Team purse is insufficient");
    Bid b=new Bid(); b.playerId=p.id; b.teamId=t.id; b.teamName=t.name; b.amount=amt; b.bidTime=LocalDateTime.now(); bids.save(b);
    highTeam=t.id; currentBid=amt; return state();
  }
  public synchronized Map<String,Object> pass(Long teamId){
    live(); Team t=team(teamId);
    if(t.id.equals(highTeam)) throw err(HttpStatus.CONFLICT,"The highest bidder cannot pass");
    passed.add(t.id); return state();
  }
  private AuctionResult record(Player p,String teamName,Double price,String st){
    AuctionResult r=new AuctionResult(); r.playerId=p.id; r.playerName=p.name; r.role=p.role; r.basePrice=p.basePrice;
    r.teamName=teamName; r.price=price; r.status=st; r.resultTime=LocalDateTime.now(); return results.save(r);
  }
  public synchronized AuctionResult sold(){
    Player p=live();
    if(highTeam==null) throw err(HttpStatus.CONFLICT,"No bids yet - cannot mark SOLD");
    Team t=team(highTeam);
    if(players.countByTeamId(t.id)>=t.maxSquad) throw err(HttpStatus.CONFLICT,"Team already has "+t.maxSquad+" players");
    if(t.purse<currentBid) throw err(HttpStatus.CONFLICT,"Team purse is insufficient");
    t.purse=r2(t.purse-currentBid); teams.save(t);
    p.status="SOLD"; p.team=t; p.soldPrice=currentBid; players.save(p);
    AuctionResult r=record(p,t.name,currentBid,"SOLD");
    currentId=null; highTeam=null; currentBid=0; passed.clear(); return r;
  }
  public synchronized AuctionResult unsold(){
    Player p=live();
    if(highTeam!=null) throw err(HttpStatus.CONFLICT,"A bid exists - mark the player SOLD instead");
    p.status="UNSOLD"; players.save(p); AuctionResult r=record(p,null,null,"UNSOLD");
    currentId=null; passed.clear(); return r;
  }
  public synchronized int reauction(){
    List<Player> l=players.findByStatus("UNSOLD"); l.forEach(p->p.status="AVAILABLE"); players.saveAll(l);
    if(status.equals("COMPLETED")) status="RUNNING"; return l.size();
  }
  public synchronized void reset(){
    results.deleteAll(); bids.deleteAll();
    List<Player> l=players.findAll(); l.forEach(p->{ p.status="AVAILABLE"; p.team=null; p.soldPrice=null; }); players.saveAll(l);
    for(Team t: teams.findAll()){ t.purse=t.initialPurse; t.playingXi.clear(); teams.save(t); }
    status="IDLE"; currentId=null; highTeam=null; currentBid=0; passed.clear();
  }
  public List<AuctionResult> history(String st){
    return results.findAllByOrderByIdDesc().stream().filter(r->st==null||st.equals(r.status)).collect(Collectors.toList());
  }

  // ---------- analytics ----------
  public Map<String,Object> analytics(){
    List<Player> all=players.findAll();
    List<Player> sold=all.stream().filter(p->"SOLD".equals(p.status)).collect(Collectors.toList());
    Map<String,Object> m=new LinkedHashMap<>();
    m.put("total",all.size());
    m.put("available",all.stream().filter(p->"AVAILABLE".equals(p.status)).count());
    m.put("sold",sold.size());
    m.put("unsold",all.stream().filter(p->"UNSOLD".equals(p.status)).count());
    double spent=sold.stream().mapToDouble(p->p.soldPrice).sum();
    m.put("totalSpent",r2(spent));
    m.put("highestBid",sold.stream().mapToDouble(p->p.soldPrice).max().orElse(0));
    m.put("averagePrice",sold.isEmpty()?0:r2(spent/sold.size()));
    m.put("roles",all.stream().collect(Collectors.groupingBy(p->p.role,TreeMap::new,Collectors.counting())));
    m.put("topPurchases",sold.stream().sorted(Comparator.comparingDouble((Player p)->p.soldPrice).reversed()).limit(5).collect(Collectors.toList()));
    List<Map<String,Object>> ts=new ArrayList<>();
    for(Team t: allTeams()){
      List<Player> sq=sold.stream().filter(p->p.team.id.equals(t.id)).collect(Collectors.toList());
      Map<String,Object> x=new LinkedHashMap<>();
      x.put("team",t); x.put("spent",r2(sq.stream().mapToDouble(p->p.soldPrice).sum()));
      x.put("roles",sq.stream().collect(Collectors.groupingBy(p->p.role,TreeMap::new,Collectors.counting())));
      ts.add(x);
    }
    m.put("teams",ts); return m;
  }
}
