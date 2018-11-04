package memo.communication.broadcasters.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import memo.communication.NotificationRepository;
import memo.communication.broadcasters.NotificationBroadcaster;
import memo.communication.model.Notification;
import memo.util.MapBuilder;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.websocket.Session;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class WebsocketMessageDispatcher {

    private NotificationRepository notificationRepository;
    private NotificationBroadcaster notificationBroadcaster;
    private SessionHandler sessionHandler;
    private final ObjectMapper mapper = new ObjectMapper();

    public WebsocketMessageDispatcher() {

    }

    @Inject
    public WebsocketMessageDispatcher(NotificationRepository notificationRepository,
                                      NotificationBroadcaster notificationBroadcaster,
                                      SessionHandler sessionHandler) {
        this.notificationRepository = notificationRepository;
        this.notificationBroadcaster = notificationBroadcaster;
        this.sessionHandler = sessionHandler;
    }


    public void sendNotifications(Session session) throws IOException {
        this.sendNotifications(session, 20, false);
    }

    public void sendNotifications(Session session, Integer amount, boolean sendTotal) throws IOException {
        String userId = (String) session.getUserProperties().get("userId");
        Integer offset = (Integer) session.getUserProperties().getOrDefault("offset", 0);

        List<Notification> notifications = notificationRepository.getByUserId(userId, amount, offset);
        List<Map<String, Object>> dataMap = notifications.stream()
                .map(it -> notificationBroadcaster.toJson(it))
                .collect(Collectors.toList());

        MapBuilder<String, Object> jsonMap = new MapBuilder<String, Object>()
                .buildPut("content", dataMap);

        if (sendTotal) {
            jsonMap.buildPut("unread", notificationRepository.getUnreadMessages(userId));
            jsonMap.buildPut("total", notificationRepository.getTotalMessages(userId));
        }

        session.getUserProperties().put("offset", offset + amount);
        String json = mapper.valueToTree(jsonMap).toString();
        this.sessionHandler.sendToSession(session, json);
    }
}
