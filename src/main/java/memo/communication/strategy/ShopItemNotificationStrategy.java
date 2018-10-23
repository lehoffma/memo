package memo.communication.strategy;

import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;

import java.util.ArrayList;
import java.util.List;

public class ShopItemNotificationStrategy extends BaseNotificationStrategy<ShopItem>{

    private void sendCreationEmails(ShopItem item) {
        if (item != null) {
            List<User> responsibleUsers = item.getAuthor();
            responsibleUsers.forEach(user -> CommunicationManager.getInstance().send(user, item, MessageType.RESPONSIBLE_USER));
        }
    }

    public void post(ShopItem item) {
        this.async(() -> this.sendCreationEmails(item));
    }

    protected void sendUpdateEmails(ShopItem changedItem) {
        if (changedItem != null) {
            //notify participants of changes
            List<OrderedItem> orders = new ArrayList<>(changedItem.getOrders());
            orders.stream()
                    .map(OrderedItem::getOrder)
                    .map(Order::getUser)
                    .distinct()
                    .forEach(participant -> CommunicationManager.getInstance().send(participant, changedItem, MessageType.OBJECT_HAS_CHANGED));
            //notify newly added responsible users
            List<User> newResponsible = new ArrayList<>(changedItem.getAuthor());
            newResponsible.stream()
                    //todo only send mails to newly added users
//                .filter(user -> previouslyResponsible.stream().noneMatch(it -> it.getId().equals(user.getId())))
                    .forEach(user -> CommunicationManager.getInstance().send(user, changedItem, MessageType.RESPONSIBLE_USER));
        }
    }


    public void put(ShopItem item) {
        this.async(() -> this.sendUpdateEmails(item));
    }
}
