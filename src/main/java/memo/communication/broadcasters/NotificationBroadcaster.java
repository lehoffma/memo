package memo.communication.broadcasters;

import com.fasterxml.jackson.databind.ObjectMapper;
import memo.communication.DataParser;
import memo.communication.NotificationRepository;
import memo.communication.ReplacementFactory;
import memo.communication.broadcasters.websocket.SessionHandler;
import memo.communication.model.Notification;
import memo.communication.model.NotificationTemplate;
import memo.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.TimeZone;

@Named
@ApplicationScoped
public class NotificationBroadcaster extends BaseMessageBroadcaster {
    private SessionHandler sessionHandler;
    private NotificationRepository notificationRepository;
    protected Logger logger = LogManager.getLogger(NotificationBroadcaster.class);
    private final ObjectMapper mapper = new ObjectMapper();

    public NotificationBroadcaster() {
        super();
    }

    @Inject
    public NotificationBroadcaster(DataParser parser,
                                   ReplacementFactory replacementService,
                                   SessionHandler sessionHandler,
                                   NotificationRepository notificationRepository) {
        super();
        this.dataParser = parser;
        this.replacementFactory = replacementService;
        this.sessionHandler = sessionHandler;
        this.notificationRepository = notificationRepository;
    }

    private String timestampToISO(Timestamp timestamp) {
        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);
        return df.format(timestamp);
    }

    public Map<String, Object> toJson(Notification notification) {
        Map<String, Object> data = new HashMap<>();
        data.put("text", this.getText(notification));
        data.put("link", this.getLink(notification));
        data.put("type", notification.getNotificationType());
        data.put("status", notification.getStatus());
        data.put("timestamp", timestampToISO(notification.getTimestamp()));
        return data;
    }

    @Override
    public String getText(Notification notification) {
        return notificationRepository.getTemplateByType(notification.getNotificationType())
                .map(NotificationTemplate::getTemplate)
                .map(text -> this.getText(notification.getData(), text))
                .orElseThrow(NotFoundException::new);
    }

    public String getLink(Notification notification) {
        return notificationRepository.getTemplateByType(notification.getNotificationType())
                .map(NotificationTemplate::getLink)
                .map(text -> this.getText(notification.getData(), text))
                .orElseThrow(NotFoundException::new);
    }

    @Override
    public boolean send(Notification notification) {
        //only send if there is a corresponding template
        Optional<NotificationTemplate> template = this.notificationRepository
                .getTemplateByType(notification.getNotificationType());
        if (!template.isPresent()) {
            return false;
        }

        User user = notification.getUser();
        try {
            String json = mapper.valueToTree(this.toJson(notification)).toString();
            sessionHandler.sendToUserSession(user.getId(), json);
            return true;
        } catch (IOException e) {
            logger.trace("Could not send notification to session for userId " + user.getId());
        }

        return false;
    }
}
