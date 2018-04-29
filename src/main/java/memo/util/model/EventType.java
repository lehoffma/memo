package memo.util.model;

import java.util.Arrays;
import java.util.Optional;

public enum EventType {
    tours(1, "tours"),
    partys(2, "partys"),
    merch(3, "merch");


    private int value;
    private String stringRepresentation;

    EventType(int value, String stringRepresentation) {
        this.value = value;
        this.stringRepresentation = stringRepresentation;
    }

    public int getValue() {
        return value;
    }

    public String getStringRepresentation() {
        return stringRepresentation;
    }

    public static Optional<EventType> findByValue(int value) {
        return Arrays.stream(EventType.values())
                .filter(type -> type.value == value)
                .findFirst();
    }

    public static Optional<EventType> findByString(String value) {
        return Arrays.stream(EventType.values())
                .filter(type -> type.stringRepresentation.equals(value))
                .findFirst();
    }
}
