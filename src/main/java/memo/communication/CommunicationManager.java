package memo.communication;

import memo.communication.mail.MailTransmitter;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

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

    public void send(User to, ShopItem item, MessageType type) {
        List<TransmitterType> transmitters = getTransmitters(to, type);
        for (TransmitterType it : transmitters) {
            MessageTransmitter transmitter = this.transmitters.get(it);
            try {
                transmitter.send(to, item, type);
            } catch (Exception e) {
                logger.error(
                        "Could not transmit " + type.getName() + "  message for " + to.getFirstName() + " " + to.getSurname()
                                + " with item " + item.getTitle(),
                        e
                );
            }
        }
    }

    private List<TransmitterType> getTransmitters(User user, MessageType type) {
        //todo remove this if block if you want to test emails
        if (type.getName().length() > 0) {
            return new ArrayList<>();
        }

        //todo extract from notification preferences
        return Arrays.asList(TransmitterType.MAIL);
    }
}
