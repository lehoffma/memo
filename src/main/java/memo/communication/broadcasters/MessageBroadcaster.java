package memo.communication.broadcasters;

import memo.communication.model.Notification;

public interface MessageBroadcaster {
    boolean send(Notification notification);

    String getText(Notification notification);
}
