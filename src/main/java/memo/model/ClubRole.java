package memo.model;



/*
 0 : Gast,
 1 : member,
 2 : board,
 3 : secretary,
 4 : funds,
 5 : organizer,
 6 : admin
  */


public enum ClubRole {
    Gast("Gast"),
    Mitglied("Mitglied"),
    Vorstand("Vorstand"),
    Schriftfuehrer("Schriftführer"),
    Kassenwart("Kassenwart"),
    Organisator("Organisator"),
    Admin("Admin");

    private String stringValue;
    ClubRole(String stringValue){
        this.stringValue = stringValue;
    }

    public String getStringValue() {
        return stringValue;
    }
}