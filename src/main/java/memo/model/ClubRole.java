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


import java.util.Arrays;
import java.util.Optional;

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

    public static Optional<ClubRole> fromString(String value){
        return Arrays.stream(ClubRole.values())
                .filter(clubRole -> clubRole.stringValue.equalsIgnoreCase(value))
                .findFirst();
    }
}