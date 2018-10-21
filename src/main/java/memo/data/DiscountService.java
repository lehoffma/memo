package memo.data;

import memo.model.*;
import memo.util.model.EventType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class DiscountService {

    public static Discount getUserDiscount() {
        return new Discount()
                .setAmount(new BigDecimal("5.00"))
                .setEligible(false)
                .setShowLink(false)
                .setLink(new Discount.DiscountLink()
                        .setUrl("/applyForMembership")
                        .setText("Werde jetzt Mitglied, um 5 Euro auf alle Touren zu sparen!"))
                .setReason("Mitglieder-Rabatt");
    }

    public static boolean isFirstOrder(ShopItem item, User user) {
        List<Order> userOrders = OrderRepository.getInstance().findByUser(user.getId().toString());

        return userOrders.stream()
                .noneMatch(order -> order.getItems().stream()
                        .anyMatch(orderedItem -> !orderedItem.getStatus().equals(OrderStatus.Cancelled)
                                && orderedItem.getItem().getId().equals(item.getId()))
                );
    }

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

        Discount discount = getUserDiscount();

        Optional<User> user = UserRepository.getInstance().getById(userId);
        user.ifPresent(it -> {
            boolean firstOrder = isFirstOrder(shopItems.get(0), it);
            discount.setEligible(firstOrder && (it.getClubRole().ordinal() > ClubRole.Gast.ordinal()));
            discount.setShowLink((it.getClubRole().ordinal() <= ClubRole.Gast.ordinal()));
        });

        return Arrays.asList(discount);
    }
}
