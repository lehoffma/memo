package memo.communication;

import memo.auth.TokenService;
import memo.communication.model.Notification;
import memo.model.*;
import memo.util.MapBuilder;
import memo.util.model.EventType;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class ReplacementFactory {
    private final String BASE_URL = "https://shop.meilenwoelfe.de/";

    public Map<String, BiFunction<Notification, Map<String, Object>, String>> getAllReplacements() {
        return new MapBuilder<String, BiFunction<Notification, Map<String, Object>, String>>()
                //notifications
                .buildPut("{ItemId}", (notification, data) -> ((ShopItem) data.get("event")).getId().toString())
                .buildPut("{ItemName}", (notification, data) -> ((ShopItem) data.get("event")).getTitle())
                .buildPut("{ItemType}", (notification, data) ->
                        EventType.findByValue(((ShopItem) data.get("event")).getType())
                                .map(EventType::getStringRepresentation)
                                .orElse(""))
                .buildPut("{ItemImage}", (notification, data) -> ((ShopItem) data.get("event")).getImages().stream()
                        .findFirst()
                        .map(Image::getApiPath)
                        .orElse(""))
                .buildPut("{UserId}", (notification, data) -> ((User) data.get("user")).getId().toString())
                .buildPut("{UserProfilePicture}", (notification, data) -> ((User) data.get("user")).getImages().stream()
                        .findFirst()
                        .map(Image::getApiPath)
                        .orElse(""))
                .buildPut("{Username}", (notification, data) -> ((User) data.get("user")).fullName())
                .buildPut("{NewClubRole}", (notification, data) ->
                        (ClubRole.fromString((String) data.get("newRole"))
                                .map(ClubRole::getStringValue)
                                .orElse("ERROR")
                        ))
                .buildPut("{OrderId}", (notification, data) ->
                        String.valueOf(((Order) data.get("order")).getId())
                )

                //email
                .buildPut("{ItemLink}", (notification, data) -> BASE_URL + "/" + ((ShopItem) data.get("event")).link())
                .buildPut("{ItemDestination}", (notification, data) -> {
                    ShopItem item = (ShopItem) data.get("event");
                    return item.getRoute().get(item.getRoute().size() - 1).getCity();
                })
                .buildPut("{Recipient}", (notification, data) -> notification.getUser().fullName())
                .buildPut("{ForgotPasswordLink}", (notification, data) ->
                        BASE_URL + "password-reset?auth_token="
                                + TokenService.getAccessToken(notification.getUser().getEmail())
                )
                .buildPut("{EmailConfirmationLink}", (notification, data) ->
                        BASE_URL + "confirm-email?token=" + TokenService.getAccessToken(notification.getUser().getEmail())
                )
                .buildPut("{OrderedItems}", (notification, data) -> {
                    List<OrderedItem> items = (List<OrderedItem>) data.get("orderedItems");

                    //todo change when rework on discount system is implemented
                    return items.stream()
                            .map(item -> "<p>" +
                                    item.getItem().getTitle() + " (" + item.getPrice() + "&#8364;)" +
                                    "</p>"
                            )
                            .collect(Collectors.joining());
                })
                .buildPut("{OrderPrice}", (notification, data) -> ((Order) data.get("order")).getItems().stream()
                        .map(OrderedItem::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .toString()
                )
                .buildPut("{OrderUsername}", (notification, data) -> ((Order) data.get("order")).getUser().fullName())
                .buildPut("{BankAccountOwner}", (notification, data) -> ((BankAcc) data.get("bankAcc")).getName())
                .buildPut("{BankAccountIBAN}", (notification, data) -> ((BankAcc) data.get("bankAcc")).getIban())
                .buildPut("{BankAccountBIC}", (notification, data) -> ((BankAcc) data.get("bankAcc")).getBic())
                .buildPut("{DebitDate}", (n, d) ->
                        LocalDateTime.now().plusDays(7).format(DateTimeFormatter.ofPattern("d.MM.uuuu")));
    }

    public Map<String, String> getReplacements(Notification notification, String template, Map<String, Object> data) {
        List<String> allMatches = new ArrayList<>();
        Pattern placeholderPattern = Pattern.compile("\\{([^{}]+)\\}");
        Matcher matcher = placeholderPattern.matcher(template);
        while (matcher.find()) {
            allMatches.add(matcher.group());
        }

        return getAllReplacements().entrySet().stream()
                // only consider those replacements that are contained in template
                .filter(entry -> allMatches.contains(entry.getKey()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().apply(notification, data)
                ));
    }
}
