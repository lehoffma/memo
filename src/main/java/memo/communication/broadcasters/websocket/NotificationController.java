package memo.communication.broadcasters.websocket;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import memo.auth.AuthenticationService;
import memo.communication.NotificationRepository;
import memo.communication.broadcasters.NotificationBroadcaster;
import memo.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.inject.Inject;
import javax.inject.Named;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Named
@ServerEndpoint(value = "/api/notifications_stream", configurator = WebsocketUserConfig.class)
public class NotificationController {
    private final static Logger logger = LogManager.getLogger(NotificationController.class);
    private final ObjectMapper mapper = new ObjectMapper();

    private SessionHandler sessionHandler;
    private NotificationRepository notificationRepository;
    private AuthenticationService authenticationService;
    private WebsocketMessageDispatcher websocketMessageDispatcher;
    private WebsocketMessageHandler websocketMessageHandler;

    public NotificationController() {
    }

    @Inject
    public NotificationController(SessionHandler sessionHandler,
                                  AuthenticationService authenticationService,
                                  NotificationRepository notificationRepository,
                                  WebsocketMessageDispatcher dispatcher,
                                  WebsocketMessageHandler handler) {
        this.sessionHandler = sessionHandler;
        this.authenticationService = authenticationService;
        this.notificationRepository = notificationRepository;
        this.websocketMessageDispatcher = dispatcher;
        this.websocketMessageHandler = handler;
    }

    @OnOpen
    public void open(Session session) throws IOException {
        String jwt = ((List<String>) session.getUserProperties().get("access_token")).get(0);
        User user = authenticationService.parseUserFromToken(jwt).orElseThrow(NotFoundException::new);

        String userId = user.getId().toString();
        session.getUserProperties().put("userId", userId);
        this.sessionHandler.addSession(session);

        Integer amount = 20;
        this.websocketMessageDispatcher.sendNotifications(session, amount, true);
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
        try {
            TypeReference<HashMap<String, Object>> typeRef = new TypeReference<HashMap<String, Object>>() {
            };
            Map<String, Object> data = mapper.readValue(message, typeRef);

            this.websocketMessageHandler.handleMessage(session, data);
        } catch (IOException e) {
            logger.error("Could not decode message: " + message, e);
        }
    }
}
