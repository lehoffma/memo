package memo.communication.mail;

import memo.auth.TokenService;
import memo.communication.MessageType;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.EventType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class MailPlaceholderFactory {

    private static String getReplacement(String placeholder, MessageType type, User recipient, ShopItem item) {
        switch (placeholder) {
            case "~Name~":
                return recipient.getFirstName() + " " + recipient.getSurname();
            case "~Ort~":
                return item.getRoute().get(item.getRoute().size() - 1).getCity();
            case "~ItemName~":
                return item.getTitle();
            case "~Preis~":
                //todo include discounts
                return item.getPrice().toString();
            case "~Link~":
                switch (type) {
                    case REGISTRATION:
                        return "http://www.meilenwoelfe.org/confirm-email?token=" + TokenService.getAccessToken(recipient.getEmail());
                    case OBJECT_HAS_CHANGED:
                        return "http://www.meilenwoelfe.org/" +
                                EventType.findByValue(item.getType())
                                        .map(EventType::getStringRepresentation).orElse("tours") +
                                "/" + item.getId();
                }
            case "~LinkPassword~":
                return "http://www.meilenwoelfe.org/forgot-password?auth_token=" + TokenService.getAccessToken(recipient.getEmail());

        }
        return "";
    }

    public static Map<String, String> getPlaceHolderReplacement(MessageType type, User recipient, ShopItem item) {
        List<String> placeHolders = getPlaceHolders(type);
        return placeHolders.stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        it -> getReplacement(it, type, recipient, item)
                ));
    }

    public static List<String> getPlaceHolders(MessageType type) {
        switch (type) {
            case REGISTRATION:
                return Arrays.asList("~Name~", "~Link~");
            case FORGOT_PASSWORD:
                return Arrays.asList("~Name~", "~LinkPassword~");
            case OBJECT_HAS_CHANGED:
                return Arrays.asList("~Name~", "~Ort~", "~Link~");
            case ORDER_CONFIRMATION:
                return Arrays.asList("~Name~", "~ItemName~", "~Preis~");
            case RESPONSIBLE_USER:
                return Arrays.asList("~Name~", "~Ort~");
            case CLUBROLE_CHANGE_REQUEST:
                return Arrays.asList(); //todo
        }
        return new ArrayList<>();
    }
}
