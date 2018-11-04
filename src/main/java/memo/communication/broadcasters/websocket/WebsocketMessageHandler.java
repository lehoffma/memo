package memo.communication.broadcasters.websocket;

import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationStatus;
import memo.util.DatabaseManager;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.websocket.Session;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.util.Map;

@Named
@ApplicationScoped
public class WebsocketMessageHandler {
    private final static Logger logger = LogManager.getLogger(WebsocketMessageHandler.class);
    private final String MESSAGE_KEY = "message";
    private WebsocketMessageDispatcher websocketMessageDispatcher;
    private NotificationRepository notificationRepository;

    public WebsocketMessageHandler() {

    }

    @Inject
    public WebsocketMessageHandler(WebsocketMessageDispatcher websocketMessageDispatcher,
                                   NotificationRepository notificationRepository) {
        this.websocketMessageDispatcher = websocketMessageDispatcher;
        this.notificationRepository = notificationRepository;
    }

    private void handleLoadMore(Session session) throws IOException {
        this.websocketMessageDispatcher.sendNotifications(session);
    }

    private void markAsStatus(Map<String, Object> data, NotificationStatus status) {
        Integer notificationId = (Integer) data.get("notificationId");
        Notification notification = this.notificationRepository.getById(notificationId)
                .orElseThrow(NotFoundException::new);

        notification.setStatus(status);
        DatabaseManager.getInstance().update(notification, Notification.class);
    }

    public void handleMessage(Session session, Map<String, Object> data) throws IOException {
        WebsocketMessageType message = WebsocketMessageType
                .getByStringValue((String) data.get(MESSAGE_KEY))
                .orElseThrow(NotFoundException::new);


        switch (message) {
            case LOAD_MORE:
                this.handleLoadMore(session);
                break;
            case MARK_AS_READ:
                this.markAsStatus(data, NotificationStatus.READ);
                break;
            case MARK_AS_DELETED:
                this.markAsStatus(data, NotificationStatus.DELETED);
                break;
            default:
                logger.error("Could not find appropriate handler for message " + message.getValue());
        }
    }
}
