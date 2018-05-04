package memo.util.model;

import java.util.Arrays;
import java.util.Optional;

public enum EventType {
    tours(1, "tours", "tour"),
    partys(2, "partys", "party"),
    merch(3, "merch", "merch");


    private int value;
    private String stringRepresentation;
    private String permissionKey;

    EventType(int value, String stringRepresentation, String permissionKey) {
        this.value = value;
        this.stringRepresentation = stringRepresentation;
        this.permissionKey = permissionKey;
    }

    public int getValue() {
        return value;
    }

    public String getStringRepresentation() {
        return stringRepresentation;
    }

    public String getPermissionKey() {
        return permissionKey;
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
