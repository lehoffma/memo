package memo.data;

import memo.auth.api.strategy.OrderAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.Order;
import memo.model.OrderedItem;
import memo.model.PaymentMethod;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.ListJoin;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    private List<Predicate> getByOrderedItemId(CriteriaBuilder builder, Root<Order> root, Filter.FilterRequest filterRequest) {
        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<Order> orderEntityType = metamodel.entity(Order.class);
        EntityType<OrderedItem> orderedItemEntityType = metamodel.entity(OrderedItem.class);
        ListJoin<Order, OrderedItem> itemsJoin = root.join(orderEntityType.getList("items", OrderedItem.class));

        List<Predicate> idMatchers = filterRequest.getValues().stream()
                .map(value -> builder.equal(
                        itemsJoin.get(orderedItemEntityType.getSingularAttribute("id")),
                        value
                ))
                .collect(Collectors.toList());

        Predicate anyIdMatches = PredicateFactory.combineByOr(builder, idMatchers);

        return Collections.singletonList(anyIdMatches);
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Order> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<Order>()
                .buildPut("userId", PredicateFactory.getIdSupplier(
                        orderRoot -> orderRoot.get("user").get("id"))
                )
                .buildPut("orderedItemId", this::getByOrderedItemId)
        );
    }
}
