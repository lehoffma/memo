package memo.communication.strategy;

import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.data.EventRepository;
import memo.data.StockRepository;
import memo.data.UserRepository;
import memo.model.ShopItem;
import memo.model.Stock;
import memo.model.User;
import memo.model.WaitingListEntry;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import memo.util.Util;

import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Named
@ApplicationScoped
public class StockNotificationStrategy extends BaseNotificationStrategy<Stock> {
    private StockRepository stockRepository;
    private EventRepository eventRepository;
    private UserRepository userRepository;
    private NotificationRepository notificationRepository;
    private ExecutorService executorService = Executors.newFixedThreadPool(1);

    public StockNotificationStrategy() {

    }

    @PreDestroy
    public void onDestroy() {
        this.executorService.shutdownNow();
    }

    @Inject
    public StockNotificationStrategy(StockRepository stockRepository,
                                     EventRepository eventRepository,
                                     UserRepository userRepository,
                                     NotificationRepository notificationRepository
                                     ) {
        this.stockRepository = stockRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    private void notifyWaitingListUsers(Stock item, Stock previous) {
        //only if amount has increased
        if (item.getAmount() <= previous.getAmount()) {
            return;
        }

        ShopItem shopItem = item.getItem();

        String itemDataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                .buildPut("itemId", shopItem.getId()));

        shopItem.getWaitingList().stream()
                //only notify those that watch the size that has been changed
                .filter(entry ->
                        entry.getColor().getId().equals(item.getColor().getId())
                                && entry.getSize().equalsIgnoreCase(item.getSize())
                )
                .map(WaitingListEntry::getUser)
                .filter(Util.distinctByKey(User::getId))
                .forEach(user -> notificationRepository.save(
                        new Notification()
                                .setUser(user)
                                .setNotificationType(NotificationType.WAITING_LIST_CAPACITY_CHANGE)
                                .setData(itemDataAsString)
                ));
    }


    @Override
    public void put(Stock item, Stock previous) {
        this.async(() -> this.notifyWaitingListUsers(item, previous), executorService);
    }
}
