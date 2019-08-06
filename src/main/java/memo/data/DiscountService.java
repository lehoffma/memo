package memo.data;

import memo.discounts.model.DiscountEntity;
import memo.model.Order;
import memo.model.OrderedItem;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

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

    public BigDecimal getDiscountedPrice(BigDecimal price, List<DiscountEntity> discounts) {
        List<DiscountEntity> copy = new ArrayList<>(discounts);
        //non-percentage discounts first, then sort by id
        copy.sort(
                Comparator.comparing(DiscountEntity::getPercentage)
                        .thenComparing(DiscountEntity::getId)
        );

        BigDecimal discounted = price;
        for (DiscountEntity discountEntity : copy) {
            if (discountEntity.getPercentage()) {
                // return price - price * (discount.amount / 100);
                discounted = discounted.subtract(
                        discounted.multiply(
                                discountEntity.getAmount().divide(
                                        BigDecimal.valueOf(100)
                                ).setScale(4, RoundingMode.HALF_UP)
                        )
                );
            } else {
                discounted = discounted.subtract(discountEntity.getAmount());
            }
        }

        if (discounted.floatValue() < 0f) {
            return BigDecimal.ZERO;
        }

        return discounted;
    }

    public BigDecimal getDiscountedPrice(OrderedItem orderedItem) {
        return getDiscountedPrice(orderedItem.getPrice(), orderedItem.getDiscounts());
    }

    public BigDecimal getTotalPrice(Order order) {
        return order.getItems().stream()
                .map(this::getDiscountedPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
