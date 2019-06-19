package memo.communication.model;

import java.util.Arrays;
import java.util.Optional;

public enum BroadcasterType {
    MAIL(0),
    NOTIFICATION(1);


    private Integer value;

    BroadcasterType(Integer value){
        this.value = value;
    }

    public static Optional<BroadcasterType> fromInteger(Integer value){
        return Arrays.stream(BroadcasterType.values())
                .filter(type -> type.getValue().equals(value))
                .findAny();
    }

    public Integer getValue() {
        return value;
    }
}
