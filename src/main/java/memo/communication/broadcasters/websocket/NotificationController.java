package memo.communication.broadcasters.websocket;


import com.fasterxml.jackson.databind.ObjectMapper;
import memo.auth.AuthenticationService;
import memo.communication.NotificationRepository;
import memo.communication.broadcasters.NotificationBroadcaster;
import memo.communication.model.Notification;
import memo.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.inject.Inject;
import javax.inject.Named;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Named
@ServerEndpoint(value = "/api/notifications_stream", configurator = WebSocketUserConfig.class)
public class NotificationController {
    private final static Logger logger = LogManager.getLogger(NotificationController.class);
    private final ObjectMapper mapper = new ObjectMapper();

    private SessionHandler sessionHandler;
    private NotificationRepository notificationRepository;
    private NotificationBroadcaster notificationBroadcaster;
    private AuthenticationService authenticationService;

    public NotificationController() {
    }

    @Inject
    public NotificationController(SessionHandler sessionHandler,
                                  AuthenticationService authenticationService,
                                  NotificationRepository notificationRepository,
                                  NotificationBroadcaster notificationBroadcaster) {
        this.sessionHandler = sessionHandler;
        this.authenticationService = authenticationService;
        this.notificationRepository = notificationRepository;
        this.notificationBroadcaster = notificationBroadcaster;
    }


    @OnOpen
    public void open(Session session) throws IOException {
        String jwt = ((List<String>) session.getUserProperties().get("access_token")).get(0);
        User user = authenticationService.parseUserFromToken(jwt).orElseThrow(NotFoundException::new);

        String userId = user.getId().toString();
        session.getUserProperties().put("userId", userId);
        this.sessionHandler.addSession(session);

        List<Notification> notifications = notificationRepository.get(userId);
        List<Map<String, Object>> dataMap = notifications.stream()
                .map(it -> notificationBroadcaster.toJson(it))
                .collect(Collectors.toList());

        String json = mapper.valueToTree(dataMap).toString();
        this.sessionHandler.sendToSession(session, json);
    }

    @OnClose
    public void close(Session session) {
        this.sessionHandler.removeSession(session);
    }

    @OnError
    public void onError(Throwable error) {
        logger.error("Error occurred during websocket exchange", error);
    }

    @OnMessage
    public void handleMessage(String message, Session session) {
        //notifications are a one-way socket, so no need to handle any messages
        //read/unread status updates are handles by the non-websocket-based notifications controller

        //todo except for: "load more"?
    }
}
