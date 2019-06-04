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
import java.util.List;
import java.util.Optional;

public enum ClubRole {
    Gast("Gast"),
    Mitglied("Mitglied"),
    Vorstand("Vorstand"),
    Schriftfuehrer("Schriftführer", "Schriftfuehrer"),
    Kassenwart("Kassenwart"),
    Organisator("Organisator"),
    Admin("Admin");

    private String stringValue;
    private String alternativeSpelling;

    ClubRole(String stringValue) {
        this.stringValue = stringValue;
        this.alternativeSpelling = stringValue;
    }

    ClubRole(String stringValue, String alternativeSpelling) {
        this.stringValue = stringValue;
        this.alternativeSpelling = alternativeSpelling;
    }

    public String getStringValue() {
        return stringValue;
    }

    public static Optional<ClubRole> fromString(String value) {
        return Arrays.stream(ClubRole.values())
                .filter(clubRole -> clubRole.stringValue.equalsIgnoreCase(value)
                        || clubRole.alternativeSpelling.equalsIgnoreCase(value))
                .findFirst();
    }


    /*
     0 : Gast,
     1 : member,
     2 : board,
     3 : secretary,
     4 : funds,
     5 : organizer,
     6 : admin
      */
    public static Optional<ClubRole> fromInteger(Integer value) {
        List<ClubRole> hierarchy = Arrays.asList(ClubRole.Gast, ClubRole.Mitglied, ClubRole.Vorstand, ClubRole.Schriftfuehrer, ClubRole.Kassenwart, ClubRole.Organisator, ClubRole.Admin);
        return hierarchy.size() >= value
                ? Optional.ofNullable(hierarchy.get(value))
                : Optional.empty();
    }
}
