package memo.communication.mail;

import memo.auth.TokenService;
import memo.communication.MessageType;
import memo.data.DiscountService;
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

    private static String getReplacement(String placeholder, MessageType type, User recipient, List<ShopItem> items, Map<String, Object> options) {
        switch (placeholder) {
            case "~Name~":
                return recipient.getFirstName() + " " + recipient.getSurname();
            case "~OrdersLink~":
                return "http://www.meilenwoelfe.org/order-history";
            case "~Items~":
                return items.stream()
                        .map(item -> "<p>" +
                                item.getTitle() + " (" +
                                DiscountService.getDiscountedPrice(item.getId(), recipient.getId()).toString() + "&#8364;)" +
                                "</p>")
                        .collect(Collectors.joining());
        }
        return "";
    }

    private static String getReplacement(String placeholder, MessageType type, User recipient, ShopItem item, Map<String, Object> options) {
        switch (placeholder) {
            case "~OrdersLink~":
                return "http://www.meilenwoelfe.org/order-history";
            case "~ShopLink~":
                return "http://www.meilenwoelfe.org/";
            case "~Name~":
                return recipient.getFirstName() + " " + recipient.getSurname();
            case "~Ort~":
                return item.getRoute().get(item.getRoute().size() - 1).getCity();
            case "~Link~":
                switch (type) {
                    case REGISTRATION:
                        return "http://www.meilenwoelfe.org/confirm-email?token=" + TokenService.getAccessToken(recipient.getEmail());
                    case OBJECT_HAS_CHANGED:
                    case RESPONSIBLE_USER:
                        return "http://www.meilenwoelfe.org/" +
                                EventType.findByValue(item.getType())
                                        .map(EventType::getStringRepresentation).orElse("tours") +
                                "/" + item.getId();
                }
            case "~LinkPassword~":
                return "http://www.meilenwoelfe.org/password-reset?auth_token=" + TokenService.getAccessToken(recipient.getEmail());

        }
        return "";
    }


    private static Map<String, String> getPlaceHolderReplacement(MessageType type, Function<String, String> getReplacement) {
        List<String> placeHolders = getPlaceHolders(type);
        return placeHolders.stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        getReplacement
                ));
    }

    public static Map<String, String> getPlaceHolderReplacement(MessageType type, User recipient, List<ShopItem> item, Map<String, Object> options) {
        return getPlaceHolderReplacement(type, (placeholder) -> getReplacement(placeholder, type, recipient, item, options));
    }

    public static Map<String, String> getPlaceHolderReplacement(MessageType type, User recipient, ShopItem item, Map<String, Object> options) {
        return getPlaceHolderReplacement(type, (placeholder) -> getReplacement(placeholder, type, recipient, item, options));
    }

    public static List<String> getPlaceHolders(MessageType type) {
        switch (type) {
            case REGISTRATION:
                return Arrays.asList("~Name~", "~Link~", "~ShopLink~");
            case FORGOT_PASSWORD:
                return Arrays.asList("~Name~", "~LinkPassword~", "~ShopLink~");
            case OBJECT_HAS_CHANGED:
                return Arrays.asList("~Name~", "~Ort~", "~Link~");
            case ORDER_CONFIRMATION:
                return Arrays.asList("~Name~", "~Items~", "~OrdersLink~");
            case RESPONSIBLE_USER:
                return Arrays.asList("~Name~", "~Ort~", "~Link~");
            case CLUBROLE_CHANGE_REQUEST:
                return Arrays.asList(); //todo
        }
        return new ArrayList<>();
    }
}
