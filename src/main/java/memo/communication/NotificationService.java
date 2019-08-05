package memo.communication;

import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.data.EventRepository;
import memo.data.OrderRepository;
import memo.data.UserRepository;
import memo.model.*;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import memo.util.Util;

import javax.ejb.LocalBean;
import javax.ejb.Schedule;
import javax.ejb.Schedules;
import javax.ejb.Stateless;
import javax.inject.Inject;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
@LocalBean
public class NotificationService {

    private EventRepository eventRepository;
    private UserRepository userRepository;
    private NotificationRepository notificationRepository;
    private OrderRepository orderRepository;

    @Inject
    public NotificationService(EventRepository eventRepository,
                               UserRepository userRepository,
                               OrderRepository orderRepository,
                               NotificationRepository notificationRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.notificationRepository = notificationRepository;
    }

    @Schedules({
            //check every day at 05:00 in the morning
            @Schedule(hour = "5"),
    })
    public void notifyUsersAboutTodaysEvents() {
        LocalDateTime timestamp = LocalDateTime.now();
        List<ShopItem> todaysEvents = new ArrayList<>(this.eventRepository.getEventsOfDay(timestamp));
        todaysEvents.stream()
                .flatMap(event -> {
                    String eventDataAsString = JsonHelper.toString(
                            new MapBuilder<String, Object>().buildPut("itemId", event.getId())
                    );

                    //todo notify responsible users too?
                    List<User> users = event.getOrders().stream()
                            //don't notify a user if he has already cancelled his order
                            .filter(order -> order.getStatus() != OrderStatus.Cancelled)
                            .map(order -> order.getOrder().getUser())
                            //no duplicate users
                            .filter(Util.distinctByKey(User::getId))
                            .collect(Collectors.toList());

                    return users.stream().map(user -> new Notification()
                            .setNotificationType(NotificationType.UPCOMING_EVENT)
                            .setUser(user)
                            .setData(eventDataAsString));
                })
                .forEach(notification -> this.notificationRepository.save(notification));
    }

    @Schedules({
            //only check on mondays
            @Schedule(dayOfWeek = "1")
    })
    public void notifyUsersAboutStaleOrders() {
        // - orders that have not been checked yet (after X days have passed and status is still Y)
        List<Order> staleOrders = new ArrayList<>(this.orderRepository.findStaleOrders());
        staleOrders.stream()
                .flatMap(order -> {
                    //todo who should get the notification?
                    return order.getItems().stream()
                            //todo what counts as "stale"/"unfinished"?
                            .filter(it -> !it.getStatus().equals(OrderStatus.Cancelled)
                                    && !it.getStatus().equals(OrderStatus.Completed)
                            )
                            .map(OrderedItem::getItem)
                            .map(ShopItem::getAuthor)
                            .flatMap(Collection::stream);
                })
                .filter(Util.distinctByKey(User::getId))
                .map(user -> new Notification()
                        .setUser(user)
                        .setNotificationType(NotificationType.CHECK_ON_ORDER)
                        .setData("{}"))
                .forEach(notification -> {
                    this.notificationRepository.save(notification);
                });
    }
}
