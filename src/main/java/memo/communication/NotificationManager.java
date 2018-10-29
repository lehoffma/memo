package memo.communication;

import memo.communication.broadcasters.MailBroadcaster;
import memo.communication.broadcasters.MessageBroadcaster;
import memo.communication.broadcasters.NotificationBroadcaster;
import memo.communication.model.BroadcasterType;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.communication.model.NotificationUnsubscription;
import memo.util.MapBuilder;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class NotificationManager {
    private NotificationRepository notificationRepository;
    private MailBroadcaster mailBroadcaster;
    private NotificationBroadcaster notificationBroadcaster;

    private Map<BroadcasterType, MessageBroadcaster> broadcasterFactory;

    public NotificationManager() {
    }

    @Inject
    public NotificationManager(NotificationRepository notificationRepository,
                               NotificationBroadcaster notificationBroadcaster,
                               MailBroadcaster mailBroadcaster) {
        this.notificationRepository = notificationRepository;
        this.notificationBroadcaster = notificationBroadcaster;
        this.mailBroadcaster = mailBroadcaster;
        this.initFactory();
    }

    private void initFactory() {
        this.broadcasterFactory = new MapBuilder<BroadcasterType, MessageBroadcaster>()
                .buildPut(BroadcasterType.MAIL, this.mailBroadcaster)
                .buildPut(BroadcasterType.NOTIFICATION, this.notificationBroadcaster);
    }

    public void observeNotification(@Observes Notification notification) {
        Integer userId = notification.getUser().getId();
        List<MessageBroadcaster> broadcasters = this.getBroadcasters(notification.getNotificationType(), userId);
        broadcasters.forEach(it -> it.send(notification));
    }

    public List<MessageBroadcaster> getBroadcasters(NotificationType notificationType, Integer userId) {
        List<BroadcasterType> bannedTypes = this.notificationRepository
                .getUnsubscriptions(userId, notificationType).stream()
                .map(NotificationUnsubscription::getBroadcasterType)
                .distinct()
                .collect(Collectors.toList());

        return this.broadcasterFactory.entrySet().stream()
                .filter(entry -> !bannedTypes.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
    }
}
