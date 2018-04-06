package memo.data;

import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.PaymentMethod;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public class OrderRepository extends AbstractRepository<Order> {

    private static final Logger logger = Logger.getLogger(OrderRepository.class);
    private static OrderRepository instance;

    private OrderRepository() {
        super(Order.class);
    }

    public static OrderRepository getInstance() {
        if (instance == null) instance = new OrderRepository();
        return instance;
    }


    public static Optional<PaymentMethod> paymentMethodFromString(String value) {
        return Arrays.stream(PaymentMethod.values())
                .filter(it -> it.toString().equalsIgnoreCase(value))
                .findFirst();
    }

    public List<OrderedItem> getOrderedItemsByOrderId(Integer id) {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o " +
                " WHERE o.order.id = :Id", OrderedItem.class)
                .setParameter("Id", id)
                .getResultList();

    }

    private List<Order> withParsedId(String id, HttpServletResponse response, Function<Integer, List<Order>> getValues) {
        try {
            Integer parsedId = Integer.parseInt(id);
            return getValues.apply(parsedId);
        } catch (NumberFormatException e) {
            try {
                response.getWriter().append("Bad ID Value");
            } catch (IOException exc) {
                exc.printStackTrace();
            }
            response.setStatus(400);
        }
        return null;
    }

    public List<Order> getOrderByOrderedItemId(String orderedItemId, HttpServletResponse response) {
        return this.withParsedId(orderedItemId, response,
                id -> DatabaseManager.createEntityManager().createQuery("SELECT o FROM Order o " +
                        " WHERE :orderedItemId IN (SELECT item.id FROM o.items item)", Order.class)
                        .setParameter("orderedItemId", id)
                        .getResultList());
    }

    public List<Order> getOrderByUserId(String userId, HttpServletResponse response) {
        return this.withParsedId(userId, response,
                id -> DatabaseManager.createEntityManager().createQuery("SELECT o FROM Order o " +
                        " WHERE o.user.id = :userId", Order.class)
                        .setParameter("userId", id)
                        .getResultList());
    }

    public List<Order> get(String orderId, String userId, String orderedItemId, HttpServletResponse response) {
        return this.getIf(
                new MapBuilder<String, Function<String, List<Order>>>()
                        .buildPut(orderId, this::get)
                        .buildPut(orderedItemId, s -> this.getOrderByOrderedItemId(s, response))
                        .buildPut(userId, s -> this.getOrderByUserId(s, response)),
                this.getAll()
        );
    }

    @Override
    public List<Order> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM Order o", Order.class).getResultList();
    }
}
