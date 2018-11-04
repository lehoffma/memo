package memo.communication.broadcasters.websocket;

import java.util.Arrays;
import java.util.Optional;

public enum WebsocketMessageType {
    LOAD_MORE("loadMore"),
    MARK_AS_READ("markAsRead"),
    MARK_AS_DELETED("markAsDeleted");

    private String value;

    WebsocketMessageType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Optional<WebsocketMessageType> getByStringValue(String value) {
        return Arrays.stream(WebsocketMessageType.values())
                .filter(it -> it.getValue().equalsIgnoreCase(value))
                .findFirst();
    }
}
