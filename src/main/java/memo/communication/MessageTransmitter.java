package memo.communication;

import memo.model.ShopItem;
import memo.model.User;

import java.util.List;
import java.util.Map;

public interface MessageTransmitter {
    default void send(User to, List<ShopItem> item, MessageType type, Map<String, Object> options) throws Exception {
        this.send(to, type.getSubject(), this.getEmailContent(to, item, type, options));
    }

    default void send(User to, ShopItem item, MessageType type, Map<String, Object> options) throws Exception {
        this.send(to, type.getSubject(), this.getEmailContent(to, item, type, options));
    }

    void send(User to, String subject, String content) throws Exception;

    String getEmailContent(User recipient, ShopItem item, MessageType type, Map<String, Object> options);

    String getEmailContent(User recipient, List<ShopItem> item, MessageType type, Map<String, Object> options);
}
