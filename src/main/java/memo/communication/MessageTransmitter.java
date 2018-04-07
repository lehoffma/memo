package memo.communication;

import memo.model.ShopItem;
import memo.model.User;

public interface MessageTransmitter {
    default void send(User to, ShopItem item, MessageType type) throws Exception {
        this.send(to, type.getSubject(), this.getEmailContent(to, item, type));
    }

    void send(User to, String subject, String content) throws Exception;

    String getEmailContent(User recipient, ShopItem item, MessageType type);
}
