package memo.communication.strategy;

import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.model.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;

@Named
@ApplicationScoped
public class UserNotificationStrategy extends BaseNotificationStrategy<User> {
    private NotificationRepository notificationRepository;

    public UserNotificationStrategy() {
    }

    @Inject
    public UserNotificationStrategy(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    private void sendRegistrationMail(User createdUser) {
        if (createdUser != null) {
            this.notificationRepository.save(
                    new Notification()
                            .setUser(createdUser)
                            .setNotificationType(NotificationType.REGISTRATION)
            );
        }
    }

    @Override
    public void post(User item) {
        this.sendRegistrationMail(item);
    }
}
