package memo.communication.mail;

import memo.auth.TokenService;
import memo.communication.MessageType;
import memo.model.*;
import memo.util.model.EventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
                return "https://shop.meilenwoelfe.de/order-history";
            case "~Items~":
                //todo price doesn't include discount properly
//                return items.stream()
//                        .map(item -> "<p>" +
//                                item.getTitle() + " (" +
//                                DiscountService.getDiscountedPrice(item.getId(), recipient.getId()).toString() + "&#8364;)" +
//                                "</p>")
//                        .collect(Collectors.joining());
        }
        return "";
    }

    private static String getReplacement(String placeholder, MessageType type, User recipient, ShopItem item, Map<String, Object> options) {
        BankAcc bankAcc;
        Order order;
        switch (placeholder) {

            case "~BankAccountName~":
                bankAcc = (BankAcc) options.get("bankAcc");
                User bankAccUser = bankAcc.getUser();
                return bankAccUser.getFirstName() + " " + bankAccUser.getSurname();
            case "~IBAN~":
                bankAcc = (BankAcc) options.get("bankAcc");
                return bankAcc.getIban();
            case "~BIC~":
                bankAcc = (BankAcc) options.get("bankAcc");
                return bankAcc.getBic();
            case "~Datum~":
                return LocalDateTime.now().plusDays(7).format(DateTimeFormatter.ofPattern("d.MM.uuuu"));
            case "~Gesamtpreis~":
                order = (Order) options.get("order");
                List<OrderedItem> items = new ArrayList<>(order.getItems());
                return items.stream().map(OrderedItem::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .toString() + " &#8364;";
            case "~BestellNr~":
                order = (Order) options.get("order");
                return String.valueOf(order.getId());
            case "~CustomerName~":
                order = (Order) options.get("order");
                User orderUser = order.getUser();
                return orderUser.getFirstName() + orderUser.getSurname();
            case "~Nachname~":
                return recipient.getSurname();
            case "~OrderName~":
                order = (Order) options.get("order");
                return order.getUser().getFirstName() + order.getUser().getSurname();

            case "~NewStatus~":
                ClubRole newStatus = (ClubRole) options.get("newRole");
                return newStatus.getStringValue();
            case "~OrdersLink~":
                return "https://shop.meilenwoelfe.de/order-history";
            case "~ShopLink~":
                return "https://shop.meilenwoelfe.de/";
            case "~Name~":
                switch (type) {
                    case CLUBROLE_CHANGE_REQUEST:
                        User user = (User) options.get("user");
                        return user.getFirstName() + " " + user.getSurname();
                    default:
                        return recipient.getFirstName() + " " + recipient.getSurname();
                }
            case "~Ort~":
                return item.getRoute().get(item.getRoute().size() - 1).getCity();
            case "~Link~":
                switch (type) {
                    case REGISTRATION:
                        return "https://shop.meilenwoelfe.de/confirm-email?token=" + TokenService.getAccessToken(recipient.getEmail());
                    case OBJECT_HAS_CHANGED:
                    case RESPONSIBLE_USER:
                        return "https://shop.meilenwoelfe.de/" +
                                EventType.findByValue(item.getType())
                                        .map(EventType::getStringRepresentation).orElse("tours") +
                                "/" + item.getId();
                }
            case "~LinkPassword~":
                return "https://shop.meilenwoelfe.de/password-reset?auth_token=" + TokenService.getAccessToken(recipient.getEmail());

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
            case CLUBROLE_CHANGE_REQUEST:
                return Arrays.asList("~Name~", "~NewStatus~");

            case ORDER_CONFIRMATION:
                return Arrays.asList("~Name~", "~Items~", "~OrdersLink~");
            case DEBIT_CUSTOMER:
                return Arrays.asList("~Name~", "~BankAccountName~", "~IBAN~", "~BIC~", "~Datum~", "~Gesamtpreis~");
            case DEBIT_TREASURER:
                return Arrays.asList("~Name~", "~CustomerName~", "~IBAN~", "~BIC~", "~Gesamtpreis~", "~BestellNr~");
            case TRANSFER_CUSTOMER:
                return Arrays.asList("~Name~", "~BestellNr~", "~Nachname~", "~Gesamtpreis~", "~Datum~");
            case TRANSFER_TREASURER:
                return Arrays.asList("~Name~", "~Datum~", "~OrderName~");

            case RESPONSIBLE_USER:
                return Arrays.asList("~Name~", "~Ort~", "~Link~");
            case OBJECT_HAS_CHANGED:
                return Arrays.asList("~Name~", "~Ort~", "~Link~");
        }
        return new ArrayList<>();
    }
}
