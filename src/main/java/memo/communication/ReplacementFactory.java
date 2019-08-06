package memo.communication;

import memo.auth.TokenService;
import memo.communication.model.Notification;
import memo.data.DiscountService;
import memo.model.*;
import memo.util.MapBuilder;
import memo.util.model.EventType;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class ReplacementFactory {
    private final String BASE_URL = "https://shop.meilenwoelfe.de/";

    private DiscountService discountService;

    public ReplacementFactory() {

    }

    @Inject
    public ReplacementFactory(DiscountService discountService) {
        this.discountService = discountService;
    }

    public Map<String, BiFunction<Notification, Map<String, Object>, String>> getAllReplacements() {
        return new MapBuilder<String, BiFunction<Notification, Map<String, Object>, String>>()
                .buildPut("{Now}", (notification, data) -> DateTimeFormatter.ISO_DATE_TIME.format(LocalDateTime.now()))
                //notifications
                .buildPut("{ItemId}", (notification, data) -> ((ShopItem) data.get("item")).getId().toString())
                .buildPut("{ItemName}", (notification, data) -> ((ShopItem) data.get("item")).getTitle())
                .buildPut("{ItemTime}", (notification, data) -> {
                    Timestamp timestamp = ((ShopItem) data.get("item")).getDate();
                    return timestamp.toLocalDateTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                })
                .buildPut("{ItemType}", (notification, data) ->
                        EventType.findByValue(((ShopItem) data.get("item")).getType())
                                .map(EventType::getStringRepresentation)
                                .orElse(""))
                .buildPut("{ItemImage}", (notification, data) -> ((ShopItem) data.get("item")).getImages().stream()
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
                .buildPut("{ItemLink}", (notification, data) -> BASE_URL + "/" + ((ShopItem) data.get("item")).link())
                .buildPut("{ItemDestination}", (notification, data) -> {
                    ShopItem item = (ShopItem) data.get("item");
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

                    return items.stream()
                            .map(item -> "<p>" +
                                    item.getItem().getTitle() + " ("
                                    + this.discountService.getDiscountedPrice(item)
                                        .setScale(2, BigDecimal.ROUND_HALF_UP)
                                    + "&#8364;)" +
                                    "</p>"
                            )
                            .collect(Collectors.joining());
                })
                .buildPut("{OrderPrice}", (notification, data) -> this.discountService
                        .getTotalPrice((Order) data.get("order"))
                        .toString()
                )
                .buildPut("{OrderUsername}", (notification, data) -> ((Order) data.get("order")).getUser().fullName())
                .buildPut("{BankAccountOwner}", (notification, data) -> ((BankAcc) data.get("bankAcc")).getName())
                .buildPut("{BankAccountIBAN}", (notification, data) -> ((BankAcc) data.get("bankAcc")).getIban())
                .buildPut("{BankAccountBIC}", (notification, data) -> ((BankAcc) data.get("bankAcc")).getBic())
                .buildPut("{DebitDate}", (n, d) ->
                        LocalDateTime.now().plusDays(7).format(DateTimeFormatter.ofPattern("d.MM.uuuu")));
    }

    /**
     * @param transformReplacement In case we need to mark or further transform the replaced data. for example,
     *                             the frontend highlights the replaced values in bold text
     */
    public Map<String, String> getReplacements(Notification notification,
                                               String template,
                                               Map<String, Object> data,
                                               Function<String, String> transformReplacement
    ) {
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
                        entry -> transformReplacement.apply(entry.getValue().apply(notification, data))
                ));
    }

    public Map<String, String> getReplacements(Notification notification, String template, Map<String, Object> data) {
        return this.getReplacements(notification, template, data, Function.identity());
    }
}
