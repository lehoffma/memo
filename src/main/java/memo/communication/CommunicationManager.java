package memo.communication;

import memo.communication.mail.MailTransmitter;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@FunctionalInterface
interface SendMessage<T> {
    void accept(MessageTransmitter transmitter, User to, T value, MessageType type, Map<String, Object> options) throws Exception;
}

public class CommunicationManager {
    protected Logger logger = Logger.getLogger(CommunicationManager.class);

    private static CommunicationManager instance;

    public static CommunicationManager getInstance() {
        if (instance == null) instance = new CommunicationManager();
        return instance;
    }

    private Map<TransmitterType, MessageTransmitter> transmitters = new MapBuilder<TransmitterType, MessageTransmitter>()
            .buildPut(TransmitterType.MAIL, new MailTransmitter());

    private CommunicationManager() {

    }

    private <T> boolean send(User to, T item, MessageType type, Map<String, Object> options, SendMessage<T> send) {
        List<TransmitterType> transmitters = getTransmitters(to, type);
        boolean atLeastOneSucceeded = false;
        for (TransmitterType it : transmitters) {
            MessageTransmitter transmitter = this.transmitters.get(it);
            try {
                send.accept(transmitter, to, item, type, options);
                atLeastOneSucceeded = true;
            } catch (Exception e) {
                String name = to == null ? "null" : to.getFirstName() + " " + to.getSurname();
                logger.error(
                        "Could not transmit " + type.getName() + "  message for " + name,
                        e
                );
            }
        }
        return atLeastOneSucceeded;
    }

    public boolean send(User to, ShopItem item, MessageType type) {
        return this.send(to, item, type, new HashMap<>(), MessageTransmitter::send);
    }

    public boolean send(User to, ShopItem item, MessageType type, Map<String, Object> options) {
        return this.send(to, item, type, options, MessageTransmitter::send);
    }

    public boolean sendList(User to, List<ShopItem> items, MessageType type) {
        return this.send(to, items, type, new HashMap<>(), MessageTransmitter::send);
    }

    public boolean sendList(User to, List<ShopItem> items, MessageType type, Map<String, Object> options) {
        return this.send(to, items, type, options, MessageTransmitter::send);
    }

    private List<TransmitterType> getTransmitters(User user, MessageType type) {
        //todo remove this if block if you want to test emails
//        if (type.getName().length() > 0) {
//            return new ArrayList<>();
//        }

        //todo extract from notification preferences
        return Arrays.asList(TransmitterType.MAIL);
    }
}
