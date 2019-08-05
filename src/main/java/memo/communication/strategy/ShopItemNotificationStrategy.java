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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiPredicate;
import java.util.function.Function;

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

    private static class ChangelogEntry {
        private String previous;
        private String current;

        public String getPrevious() {
            return previous;
        }

        public ChangelogEntry setPrevious(String previous) {
            this.previous = previous;
            return this;
        }

        public String getCurrent() {
            return current;
        }

        public ChangelogEntry setCurrent(String current) {
            this.current = current;
            return this;
        }
    }


    private <T> Map<String, ChangelogEntry> addToChangelog(Map<String, ChangelogEntry> changes,
                                                           ShopItem current, ShopItem previous,
                                                           String key,
                                                           Function<ShopItem, T> getValue,
                                                           BiPredicate<T, T> isEqual) {
        return this.addToChangelog(changes, current, previous, key, getValue, isEqual, Object::toString);
    }

    private <T> Map<String, ChangelogEntry> addToChangelog(Map<String, ChangelogEntry> changes,
                                                           ShopItem current, ShopItem previous,
                                                           String key,
                                                           Function<ShopItem, T> getValue,
                                                           BiPredicate<T, T> isEqual,
                                                           Function<T, String> toString
    ) {
        T currentValue = getValue.apply(current);
        T previousValue = getValue.apply(previous);
        if (!isEqual.test(currentValue, previousValue)) {
            changes.put(key, new ChangelogEntry()
                    .setPrevious(toString.apply(previousValue))
                    .setCurrent(toString.apply(currentValue))
            );
        }
        return changes;
    }

    private Map<String, ChangelogEntry> getChangelog(ShopItem current, ShopItem previous) {
        //todo this might be a bit much for the database, especially if the description is long and there are a lot of participants
        //title, description, price, datetime, capacity, route, vehicle, paymentMethods, paymentLimit
        Map<String, ChangelogEntry> changes = new HashMap<>();
        this.addToChangelog(changes, current, previous, "title", ShopItem::getTitle, String::equalsIgnoreCase);
        this.addToChangelog(changes, current, previous, "description", ShopItem::getDescription, String::equalsIgnoreCase);

        return changes;
    }

    protected void sendUpdateEmails(ShopItem changedItem, ShopItem previous) {
        if (changedItem != null) {
            //notify participants of changes
            List<OrderedItem> orders = new ArrayList<>(changedItem.getOrders());

            //todo save "changelog", i.e. which attributes have been changed?
            String changelogDataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                    .buildPut("itemId", changedItem.getId())
//                    .buildPut("changes", this.getChangelog(changedItem, previous))
            );

            orders.stream()
                    .map(OrderedItem::getOrder)
                    .map(Order::getUser)
                    .distinct()
                    .forEach(participant -> notificationRepository.save(
                            new Notification()
                                    .setUser(participant)
                                    .setNotificationType(NotificationType.OBJECT_HAS_CHANGED)
                                    .setData(changelogDataAsString)
                    ));

            String itemDataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                    .buildPut("itemId", changedItem.getId()));

            //notify newly added responsible users
            List<User> newResponsible = new ArrayList<>(changedItem.getAuthor());
            List<User> previousResponsible = new ArrayList<>(previous.getAuthor());
            newResponsible.stream()
                    //only send mails to newly added users
                    .filter(user -> previousResponsible.stream().noneMatch(it -> it.getId().equals(user.getId())))
                    .forEach(user -> notificationRepository.save(
                            new Notification()
                                    .setUser(user)
                                    .setNotificationType(NotificationType.RESPONSIBLE_USER)
                                    .setData(itemDataAsString)
                    ));


            //notify newly added report-responsible people
            List<User> newReportWriters = new ArrayList<>(changedItem.getReportWriters());
            List<User> previousReportWriters = new ArrayList<>(previous.getReportWriters());

            newReportWriters.stream()
                    //only send mails to newly added users
                    .filter(user -> previousReportWriters.stream().noneMatch(it -> it.getId().equals(user.getId())))
                    .forEach(user -> notificationRepository.save(
                            new Notification()
                                    .setUser(user)
                                    .setNotificationType(NotificationType.MARKED_AS_REPORT_WRITER)
                                    .setData(itemDataAsString)
                    ));
        }
    }


    public void put(ShopItem item, ShopItem previous) {
        this.async(() -> this.sendUpdateEmails(item, previous));
    }
}
