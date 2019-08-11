package memo.communication.strategy;

import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.model.Comment;
import memo.model.User;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.annotation.PreDestroy;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Named
@ApplicationScoped
public class CommentNotificationStrategy extends BaseNotificationStrategy<Comment> {
    private static final Logger logger = LogManager.getLogger(CommentNotificationStrategy.class);
    private NotificationRepository notificationRepository;
    private ExecutorService executorService = Executors.newFixedThreadPool(1);

    public CommentNotificationStrategy() {
        super();
    }

    @PreDestroy
    public void onDestroy() {
        this.executorService.shutdownNow();
    }

    @Inject
    public CommentNotificationStrategy(NotificationRepository notificationRepository) {
        super();
        this.notificationRepository = notificationRepository;
    }

    private void notifyResponsiblePeople(Comment comment) {
        //get responsible persons for comment
        List<User> responsibleUsers = comment.getItem().getAuthor();

        String dataAsString = JsonHelper.toString(new MapBuilder<String, Object>()
                .buildPut("userId", comment.getAuthor().getId())
                .buildPut("itemId", comment.getItem().getId())
        );

        responsibleUsers.forEach(responsible -> notificationRepository.save(
                new Notification()
                        .setNotificationType(NotificationType.NEW_COMMENT)
                        .setUser(responsible)
                        .setData(dataAsString)
        ));
    }

    @Override
    public void post(Comment comment) {
        this.async(() -> this.notifyResponsiblePeople(comment), executorService);
    }
}
