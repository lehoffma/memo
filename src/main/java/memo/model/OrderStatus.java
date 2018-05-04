package memo.model;


import java.util.Arrays;
import java.util.Optional;

public enum OrderStatus {
    Reserved,
    Ordered,
    Paid,
    Sent,
    Completed,
    Cancelled,
    Refused,
    UnderApproval;


    public static Optional<OrderStatus> fromOrdinal(int ordinal){
        return Arrays.stream(OrderStatus.values())
                .filter(it -> it.ordinal() == ordinal)
                .findFirst();
    }
}
