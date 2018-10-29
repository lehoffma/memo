package memo.communication.strategy;

import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.List;

@Named
@ApplicationScoped
public class ShopItemNotificationStrategy extends BaseNotificationStrategy<ShopItem> {
    private static final Logger logger = LogManager.getLogger(ShopItemNotificationStrategy.class);
    private NotificationRepository notificationRepository;

    public ShopItemNotificationStrategy() {
        super();
    }

    @Inject
    public ShopItemNotificationStrategy(NotificationRepository notificationRepository) {
        super();
        this.notificationRepository = notificationRepository;
    }

    private void sendCreationEmails(ShopItem item) {
        if (item != null) {
            List<User> responsibleUsers = item.getAuthor();

            String dataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                    .buildPut("itemId", item.getId()));

            responsibleUsers.forEach(user -> notificationRepository.save(
                    new Notification()
                            .setUser(user)
                            .setNotificationType(NotificationType.RESPONSIBLE_USER)
                            .setData(dataAsString)
            ));
        }
    }

    public void post(ShopItem item) {
        this.async(() -> this.sendCreationEmails(item));
    }

    protected void sendUpdateEmails(ShopItem changedItem) {
        if (changedItem != null) {
            //notify participants of changes
            List<OrderedItem> orders = new ArrayList<>(changedItem.getOrders());

            String dataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                    .buildPut("itemId", changedItem.getId()));

            orders.stream()
                    .map(OrderedItem::getOrder)
                    .map(Order::getUser)
                    .distinct()
                    .forEach(participant -> notificationRepository.save(
                            new Notification()
                                    .setUser(participant)
                                    .setNotificationType(NotificationType.OBJECT_HAS_CHANGED)
                                    .setData(dataAsString)
                    ));

            //notify newly added responsible users
            List<User> newResponsible = new ArrayList<>(changedItem.getAuthor());
            newResponsible.stream()
                    //todo only send mails to newly added users
//                .filter(user -> previouslyResponsible.stream().noneMatch(it -> it.getId().equals(user.getId())))
                    .forEach(user -> notificationRepository.save(
                            new Notification()
                                    .setUser(user)
                                    .setNotificationType(NotificationType.RESPONSIBLE_USER)
                                    .setData(dataAsString)
                    ));
        }
    }


    public void put(ShopItem item) {
        this.async(() -> this.sendUpdateEmails(item));
    }
}
