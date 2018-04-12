package memo.communication;

import memo.model.ShopItem;
import memo.model.User;

import java.util.List;
import java.util.Map;

public interface MessageTransmitter {
    default void send(User to, List<ShopItem> item, MessageType type, Map<String, Object> options) throws Exception {
        this.send(to, type.getSubject(), this.getContent(to, item, type, options));
    }

    default void send(User to, ShopItem item, MessageType type, Map<String, Object> options) throws Exception {
        this.send(to, type.getSubject(), this.getContent(to, item, type, options));
    }

    void send(User to, String subject, String content) throws Exception;

    String getContent(User recipient, ShopItem item, MessageType type, Map<String, Object> options);

    String getContent(User recipient, List<ShopItem> item, MessageType type, Map<String, Object> options);
}
