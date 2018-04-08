package memo.data;

import memo.model.ClubRole;
import memo.model.Discount;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.EventType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class DiscountService {

    public static BigDecimal getDiscountedPrice(Integer eventId, Integer userId) {
        return getDiscountedPrice("" + eventId, "" + userId);
    }

    public static BigDecimal getDiscountedPrice(String eventId, String userId) {
        return EventRepository.getInstance().getById(eventId)
                .map(event -> event.getPrice().subtract(getUserDiscount(eventId, userId).stream()
                        .filter(Discount::getEligible)
                        .map(Discount::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                )
                .map(price -> price.max(BigDecimal.ZERO))
                .orElse(BigDecimal.ZERO);
    }

    public static List<Discount> getUserDiscount(String eventId, String userId) {
        List<ShopItem> shopItems = EventRepository.getInstance().get(eventId);
        if (shopItems.isEmpty() || shopItems.get(0).getType() != EventType.tours.getValue()) {
            return new ArrayList<>();
        }

        Discount discount = new Discount()
                .setAmount(new BigDecimal("5.00"))
                .setEligible(false)
                .setLink(new Discount.DiscountLink()
                        .setUrl("/applyForMembership")
                        .setText("Werde jetzt Mitglied, um 5 Euro auf alle Touren zu sparen!"))
                .setReason("Mitglieder-Rabatt");

        Optional<User> user = UserRepository.getInstance().getById(userId);
        user.ifPresent(it -> discount.setEligible(it.getClubRole().ordinal() > ClubRole.Gast.ordinal()));

        return Arrays.asList(discount);
    }
}
