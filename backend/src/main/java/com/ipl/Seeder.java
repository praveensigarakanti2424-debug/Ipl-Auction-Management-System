package com.ipl;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Map;
@Component
public class Seeder implements CommandLineRunner {
  private final PlayerRepo pr; private final TeamRepo tr;
  public Seeder(PlayerRepo pr, TeamRepo tr){ this.pr=pr; this.tr=tr; }
  static final Map<String,String> ROLES=Map.of("B","BATSMAN","W","WICKET-KEEPER","A","ALL-ROUNDER","L","BOWLER");
  static final Map<String,String> ORD=Map.of("OP","Opener","TO","Top Order","MO","Middle Order","LM","Lower Middle Order","FN","Finisher","WK","Wicket-Keeper","FB","Fast Bowler","SP","Spinner","BA","Batting All-Rounder","BW","Bowling All-Rounder");
  static final String DATA = """
Virat Kohli|I|B|TO|2
Rohit Sharma|I|B|OP|2
Shubman Gill|I|B|OP|2
Yashasvi Jaiswal|I|B|OP|2
Suryakumar Yadav|I|B|MO|2
Ruturaj Gaikwad|I|B|OP|2
Shreyas Iyer|I|B|MO|2
Rinku Singh|I|B|FN|1
Sai Sudharsan|I|B|OP|1
Tilak Varma|I|B|MO|1
Abhishek Sharma|I|B|OP|1
Devdutt Padikkal|I|B|TO|1
Prithvi Shaw|I|B|OP|1
Rajat Patidar|I|B|MO|1
Nitish Rana|I|B|MO|0.5
Ayush Badoni|I|B|FN|0.5
Travis Head|Australia|B|OP|2
David Warner|Australia|B|OP|2
Steve Smith|Australia|B|TO|1.5
Tim David|Australia|B|FN|1.5
Faf du Plessis|South Africa|B|OP|1.5
David Miller|South Africa|B|FN|1.5
Kane Williamson|New Zealand|B|TO|1.5
Devon Conway|New Zealand|B|OP|1.5
Joe Root|England|B|TO|1.5
Harry Brook|England|B|MO|1.5
Shimron Hetmyer|West Indies|B|FN|1.5
Rishabh Pant|I|W|WK|2
KL Rahul|I|W|WK|2
Sanju Samson|I|W|WK|2
Ishan Kishan|I|W|WK|1.5
Jitesh Sharma|I|W|WK|1
Dhruv Jurel|I|W|WK|1
Jos Buttler|England|W|WK|2
Phil Salt|England|W|WK|2
Jonny Bairstow|England|W|WK|1.5
Heinrich Klaasen|South Africa|W|WK|2
Quinton de Kock|South Africa|W|WK|2
Ryan Rickelton|South Africa|W|WK|1
Nicholas Pooran|West Indies|W|WK|2
Rahmanullah Gurbaz|Afghanistan|W|WK|1
Josh Inglis|Australia|W|WK|1.5
Hardik Pandya|I|A|BA|2
Ravindra Jadeja|I|A|BW|2
Axar Patel|I|A|BW|2
Washington Sundar|I|A|BW|1.5
Shivam Dube|I|A|BA|1.5
Riyan Parag|I|A|BA|1
Venkatesh Iyer|I|A|BA|1.5
Krunal Pandya|I|A|BW|1
Nitish Kumar Reddy|I|A|BA|1
Shahbaz Ahmed|I|A|BW|0.5
Sunil Narine|West Indies|A|BW|2
Andre Russell|West Indies|A|BA|2
Liam Livingstone|England|A|BA|2
Sam Curran|England|A|BA|2
Ben Stokes|England|A|BA|2
Moeen Ali|England|A|BW|1.5
Marcus Stoinis|Australia|A|BA|2
Glenn Maxwell|Australia|A|BA|2
Mitchell Marsh|Australia|A|BA|2
Cameron Green|Australia|A|BA|2
Rachin Ravindra|New Zealand|A|BA|1.5
Mitchell Santner|New Zealand|A|BW|1.5
Marco Jansen|South Africa|A|BW|1.5
Jasprit Bumrah|I|L|FB|2
Mohammed Shami|I|L|FB|2
Mohammed Siraj|I|L|FB|2
Arshdeep Singh|I|L|FB|2
Bhuvneshwar Kumar|I|L|FB|1.5
Deepak Chahar|I|L|FB|1.5
Harshal Patel|I|L|FB|1
Avesh Khan|I|L|FB|1
Prasidh Krishna|I|L|FB|1
Mukesh Kumar|I|L|FB|1
T Natarajan|I|L|FB|1
Khaleel Ahmed|I|L|FB|1
Harshit Rana|I|L|FB|1
Mayank Yadav|I|L|FB|1
Shardul Thakur|I|L|FB|1
Kuldeep Yadav|I|L|SP|2
Yuzvendra Chahal|I|L|SP|2
Varun Chakravarthy|I|L|SP|2
Ravi Bishnoi|I|L|SP|1
Ravichandran Ashwin|I|L|SP|1.5
Trent Boult|New Zealand|L|FB|2
Lockie Ferguson|New Zealand|L|FB|1.5
Kagiso Rabada|South Africa|L|FB|2
Anrich Nortje|South Africa|L|FB|1.5
Mitchell Starc|Australia|L|FB|2
Pat Cummins|Australia|L|FB|2
Josh Hazlewood|Australia|L|FB|2
Adam Zampa|Australia|L|SP|1.5
Jofra Archer|England|L|FB|2
Rashid Khan|Afghanistan|L|SP|2
Noor Ahmad|Afghanistan|L|SP|1
Matheesha Pathirana|Sri Lanka|L|FB|1.5
Wanindu Hasaranga|Sri Lanka|L|SP|1.5
Maheesh Theekshana|Sri Lanka|L|SP|1
Mustafizur Rahman|Bangladesh|L|FB|1.5
""";
  public void run(String... args){
    if(tr.count()==0) for(String n: new String[]{"Mumbai Warriors","Chennai Super Kings","Royal Challengers","Kolkata Riders"}){
      Team t=new Team(); t.name=n; t.initialPurse=100; t.purse=100; tr.save(t); }
    if(pr.count()==0) for(String l: DATA.strip().split("\n")){
      String[] f=l.strip().split("\\|"); Player p=new Player(); p.name=f[0];
      p.country=f[1].equals("I")?"India":f[1]; p.overseas=!p.country.equals("India");
      p.role=ROLES.get(f[2]); p.playingOrder=ORD.get(f[3]); p.basePrice=Double.parseDouble(f[4]); pr.save(p); }
  }
}
