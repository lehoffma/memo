package memo.communication.model;

import java.util.Arrays;
import java.util.Optional;

public enum NotificationType {
    //email only
    REGISTRATION(0),
    FORGOT_PASSWORD(1),
    ORDER_CONFIRMATION(2),

    DEBIT_CUSTOMER(3),
    TRANSFER_CUSTOMER(4),


    //both
    CLUBROLE_CHANGE_REQUEST(5),
    RESPONSIBLE_USER(6),
    OBJECT_HAS_CHANGED(7),

    DEBIT_TREASURER(8),
    TRANSFER_TREASURER(9),
    NEW_COMMENT(10),
    MARKED_AS_REPORT_WRITER(11),

    //notification only
    UPCOMING_EVENT(12),
    CHECK_ON_ORDER(13),
    WAITING_LIST_CAPACITY_CHANGE(14);


    private Integer value;

    NotificationType(Integer value){
        this.value = value;
    }

    public static Optional<NotificationType> fromInteger(Integer value){
        return Arrays.stream(NotificationType.values())
                .filter(type -> type.getValue().equals(value))
                .findAny();
    }

    public Integer getValue() {
        return value;
    }
}
