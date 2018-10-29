package memo.communication.broadcasters.websocket;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import javax.json.JsonObject;
import javax.websocket.Session;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class SessionHandler {
    protected Logger logger = LogManager.getLogger(SessionHandler.class);
    private final Set<Session> sessions = new HashSet<>();

    public void addSession(Session session) {
        sessions.add(session);
    }

    public void removeSession(Session session) {
        sessions.remove(session);
    }

    public void sendToAllConnectedSessions(JsonObject message) throws IOException {
        this.sendToAllConnectedSessions(message.toString());
    }

    public void sendToAllConnectedSessions(String message) throws IOException {
        for (Session session : sessions) {
            this.sendToSession(session, message);
        }
    }


    public void sendToUserSession(Integer userId, JsonObject message) throws IOException {
        this.sendToUserSession(userId, message.toString());
    }

    public void sendToUserSession(Integer userId, String message) throws IOException {
        List<Session> userSession = this.sessions.stream()
                .filter(session -> session.getUserProperties().get("userId").equals(userId.toString()))
                .collect(Collectors.toList());

        if (userSession.isEmpty()) {
            logger.trace("Could not find user session for user id: " + userId);
            return;
        }

        Session session = userSession.get(0);
        this.sendToSession(session, message);
    }

    public void sendToSession(Session session, JsonObject message) throws IOException {
        this.sendToSession(session, message.toString());
    }

    public void sendToSession(Session session, String message) throws IOException {
        session.getBasicRemote().sendText(message);
    }
}
