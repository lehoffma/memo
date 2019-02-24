package memo.data;

import memo.model.*;
import memo.util.model.EventType;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Named
@ApplicationScoped
public class DiscountService {
    private OrderRepository orderRepository;
    private EventRepository eventRepository;
    private UserRepository userRepository;

    public DiscountService() {
    }

    @Inject
    public DiscountService(OrderRepository orderRepository,
                           EventRepository eventRepository,
                           UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Discount getUserDiscount() {
        return new Discount()
                .setAmount(new BigDecimal("5.00"))
                .setEligible(false)
                .setShowLink(false)
                .setLink(new Discount.DiscountLink()
                        .setUrl("/membership/apply")
                        .setText("Werde jetzt Mitglied, um 5 Euro auf alle Touren zu sparen!"))
                .setReason("Mitglieder-Rabatt");
    }

    public boolean isFirstOrder(ShopItem item, User user) {
        List<Order> userOrders = orderRepository.findByUser(user.getId().toString());

        return userOrders.stream()
                .noneMatch(order -> order.getItems().stream()
                        .anyMatch(orderedItem -> !orderedItem.getStatus().equals(OrderStatus.Cancelled)
                                && orderedItem.getItem().getId().equals(item.getId()))
                );
    }

    public BigDecimal getDiscountedPrice(Integer eventId, Integer userId) {
        return getDiscountedPrice("" + eventId, "" + userId);
    }

    public BigDecimal getDiscountedPrice(String eventId, String userId) {
        return eventRepository.getById(eventId)
                .map(event -> event.getPrice().subtract(getUserDiscount(eventId, userId).stream()
                        .filter(Discount::getEligible)
                        .map(Discount::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                )
                .map(price -> price.max(BigDecimal.ZERO))
                .orElse(BigDecimal.ZERO);
    }

    public List<Discount> getUserDiscount(String eventId, String userId) {
        List<ShopItem> shopItems = eventRepository.get(eventId);
        if (shopItems.isEmpty() || shopItems.get(0).getType() != EventType.tours.getValue()) {
            return new ArrayList<>();
        }

        Discount discount = getUserDiscount();

        Optional<User> user = userRepository.getById(userId);
        user.ifPresent(it -> {
            boolean firstOrder = isFirstOrder(shopItems.get(0), it);
            discount.setEligible(firstOrder && (it.getClubRole().ordinal() > ClubRole.Gast.ordinal()));
            discount.setShowLink((it.getClubRole().ordinal() <= ClubRole.Gast.ordinal()));
        });

        return Arrays.asList(discount);
    }
}
