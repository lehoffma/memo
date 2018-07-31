package memo.data.model;

import java.util.Arrays;
import java.util.Optional;

public enum SerializationOption {
    PAGE("page"),
    CSV("csv"),
    PDF("pdf");

    String value;

    SerializationOption(String value) {
        this.value = value;
    }

    public String toStringValue() {
        return this.value;
    }

    public static Optional<SerializationOption> fromString(String value) {
        return Arrays.stream(SerializationOption.values())
                .filter(it -> it.value.equalsIgnoreCase(value))
                .findFirst();
    }
}
