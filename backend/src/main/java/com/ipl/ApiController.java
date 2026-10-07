package com.ipl;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api")
public class ApiController {
  private final AuctionService s;
  public ApiController(AuctionService s){ this.s=s; }
  private static long tid(Map<String,Number> b){
    if(b==null||b.get("teamId")==null) throw new ApiException(HttpStatus.BAD_REQUEST,"teamId is required"); return b.get("teamId").longValue(); }

  @GetMapping("/players") public List<Player> players(@RequestParam(required=false) String status,@RequestParam(required=false) String role){ return s.listPlayers(status,role); }
  @GetMapping("/players/{id}") public Player player(@PathVariable Long id){ return s.player(id); }
  @PostMapping("/players") @ResponseStatus(HttpStatus.CREATED) public Player add(@RequestBody Player p){ return s.createPlayer(p); }
  @PutMapping("/players/{id}") public Player edit(@PathVariable Long id,@RequestBody Player p){ return s.updatePlayer(id,p); }
  @DeleteMapping("/players/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void del(@PathVariable Long id){ s.deletePlayer(id); }

  @GetMapping("/teams") public List<Team> teams(){ return s.allTeams(); }
  @GetMapping("/teams/{id}") public Team team(@PathVariable Long id){ return s.teamView(id); }
  @PutMapping("/teams/{id}") public Team updateTeam(@PathVariable Long id,@RequestBody Map<String,Object> b){ return s.updateTeam(id,b); }
  @PutMapping("/teams/{id}/xi") public Team xi(@PathVariable Long id,@RequestBody List<Long> ids){ return s.setXi(id,ids); }

  @GetMapping({"/auction/current","/auction/state","/bids/current"}) public Map<String,Object> state(){ return s.state(); }
  @PostMapping("/auction/start") public Map<String,Object> start(){ return s.start(); }
  @PostMapping("/auction/next") public Map<String,Object> next(){ return s.next(); }
  @PostMapping("/auction/pause") public Map<String,Object> pause(){ return s.pause(); }
  @PostMapping("/auction/resume") public Map<String,Object> resume(){ return s.resume(); }
  @PostMapping({"/auction/bid","/bids"}) public Map<String,Object> bid(@RequestBody(required=false) Map<String,Number> b){ return s.bid(tid(b)); }
  @PostMapping("/auction/pass") public Map<String,Object> pass(@RequestBody(required=false) Map<String,Number> b){ return s.pass(tid(b)); }
  @PostMapping("/auction/sold") public AuctionResult sold(){ return s.sold(); }
  @PostMapping("/auction/unsold") public AuctionResult unsold(){ return s.unsold(); }
  @PostMapping("/auction/reauction") public Map<String,Object> reauction(){ return Map.of("moved",s.reauction()); }
  @PostMapping("/auction/reset") public Map<String,Object> reset(){ s.reset(); return s.state(); }
  @PutMapping("/auction/settings") public Map<String,Object> settings(@RequestBody Map<String,Number> b){
    if(b==null||b.get("increment")==null) throw new ApiException(HttpStatus.BAD_REQUEST,"increment is required"); return s.setIncrement(b.get("increment").doubleValue()); }
  @GetMapping("/auction/history") public List<AuctionResult> history(){ return s.history(null); }
  @GetMapping("/auction/sold") public List<AuctionResult> soldList(){ return s.history("SOLD"); }
  @GetMapping("/auction/unsold") public List<AuctionResult> unsoldList(){ return s.history("UNSOLD"); }
  @GetMapping("/analytics") public Map<String,Object> analytics(){ return s.analytics(); }
}
