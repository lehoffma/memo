package memo.communication.strategy;

import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.data.UserRepository;
import memo.model.BankAcc;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.User;
import memo.util.JsonHelper;
import memo.util.MapBuilder;

import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class OrderNotificationStrategy extends BaseNotificationStrategy<Order> {
    private NotificationRepository notificationRepository;
    private UserRepository userRepository;
    private ExecutorService executorService = Executors.newFixedThreadPool(1);

    public OrderNotificationStrategy() {

    }

    @PreDestroy
    public void onDestroy() {
        this.executorService.shutdownNow();
    }

    @Inject
    public OrderNotificationStrategy(NotificationRepository notificationRepository,
                                     UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private void postOrder(Order order) {
        if (order == null) {
            return;
        }
        User user = order.getUser();
        List<Integer> orderedItems = order.getItems().stream()
                .map(OrderedItem::getId)
                .collect(Collectors.toList());

        String dataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                .buildPut("orderedItemIds", orderedItems)
        );

        notificationRepository.save(new Notification()
                .setUser(user)
                .setNotificationType(NotificationType.ORDER_CONFIRMATION)
                .setData(dataAsString)
        );

        User admin = userRepository.getAdmin();
        BankAcc bankAccount = order.getBankAccount();
        Map<String, Object> options = new MapBuilder<String, Object>()
                .buildPut("orderId", order.getId());

        if (bankAccount != null) {
            options.put("bankAccId", bankAccount.getId());
        }

        dataAsString = JsonHelper.toString(options);
        switch (order.getMethod()) {
            case Bar:
                break;
            case Lastschrift:
                notificationRepository.save(new Notification()
                        .setUser(user)
                        .setNotificationType(NotificationType.DEBIT_CUSTOMER)
                        .setData(dataAsString)
                );
                notificationRepository.save(new Notification()
                        .setUser(admin)
                        .setNotificationType(NotificationType.DEBIT_TREASURER)
                        .setData(dataAsString)
                );

                break;
            case Überweisung:
                notificationRepository.save(new Notification()
                        .setUser(user)
                        .setNotificationType(NotificationType.TRANSFER_CUSTOMER)
                        .setData(dataAsString)
                );
                notificationRepository.save(new Notification()
                        .setUser(admin)
                        .setNotificationType(NotificationType.TRANSFER_TREASURER)
                        .setData(dataAsString)
                );
                break;
        }
    }

    @Override
    public void post(Order item) {
        this.async(() -> this.postOrder(item), executorService);
    }
}
