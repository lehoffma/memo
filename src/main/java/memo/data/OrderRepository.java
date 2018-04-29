package memo.data;

import memo.auth.api.OrderAuthStrategy;
import memo.model.Order;
import memo.model.PaymentMethod;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public class OrderRepository extends AbstractPagingAndSortingRepository<Order> {

    private static final Logger logger = Logger.getLogger(OrderRepository.class);
    private static OrderRepository instance;

    private OrderRepository() {
        super(Order.class, new OrderAuthStrategy());
    }

    public static OrderRepository getInstance() {
        if (instance == null) instance = new OrderRepository();
        return instance;
    }

    public static Optional<PaymentMethod> findPaymentMethodByString(String value) {
        return Arrays.stream(PaymentMethod.values())
                .filter(it -> it.getTextValue().equalsIgnoreCase(value))
                .findFirst();
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


    public List<Order> findByOrderedItem(String orderedItemId, HttpServletResponse response) {
        return this.withParsedId(orderedItemId, response,
                id -> DatabaseManager.createEntityManager()
                        .createNamedQuery("Order.findByOrderedItem", Order.class)
                        .setParameter("orderedItemId", id)
                        .getResultList());
    }

    public List<Order> findByUser(String userId, HttpServletResponse response) {
        return this.withParsedId(userId, response,
                id -> DatabaseManager.createEntityManager()
                        .createNamedQuery("Order.findByUser", Order.class)
                        .setParameter("userId", id)
                        .getResultList());
    }

    public List<Order> get(String orderId, String userId, String orderedItemId, HttpServletResponse response) {
        return this.getIf(
                new MapBuilder<String, Function<String, List<Order>>>()
                        .buildPut(orderId, this::get)
                        .buildPut(orderedItemId, s -> this.findByOrderedItem(s, response))
                        .buildPut(userId, s -> this.findByUser(s, response)),
                this.getAll()
        );
    }

    @Override
    public List<Order> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM Order o", Order.class).getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Order> root, Filter.FilterRequest filterRequest) {
        /*
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "userId"),
                        getParameter(paramMap, "orderedItemId"),
         */
        switch (filterRequest.getKey()) {
            case "id":
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), Integer.valueOf(filterRequest.getValue()))
                );
            case "userId":
                return null;
            case "orderedItemId":
                return null;
            default:
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), filterRequest.getValue())
                );
        }
    }
}
