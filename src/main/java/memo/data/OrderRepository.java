package memo.data;

import memo.auth.api.strategy.OrderAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.Order;
import memo.model.*;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.criteria.*;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class OrderRepository extends AbstractPagingAndSortingRepository<Order> {
    private static final Logger logger = LogManager.getLogger(OrderRepository.class);

    public OrderRepository() {
        super(Order.class);
    }

    @Inject
    public OrderRepository(OrderAuthStrategy orderAuthStrategy) {
        super(Order.class);
        this.authenticationStrategy = orderAuthStrategy;
    }

    public static Optional<PaymentMethod> findPaymentMethodByString(String value) {
        return Arrays.stream(PaymentMethod.values())
                .filter(it -> it.getTextValue().equalsIgnoreCase(value))
                .findFirst();
    }

    private List<Order> withParsedId(String id, Function<Integer, List<Order>> getValues) {
        try {
            Integer parsedId = Integer.parseInt(id);
            return getValues.apply(parsedId);
        } catch (NumberFormatException e) {
            logger.error("Could not parse Id  " + id);
        }
        return null;
    }


    public List<Order> findByOrderedItem(String orderedItemId) {
        return this.withParsedId(orderedItemId,
                id -> DatabaseManager.createEntityManager()
                        .createNamedQuery("Order.findByOrderedItem", Order.class)
                        .setParameter("orderedItemId", id)
                        .getResultList());
    }

    public List<Order> findByUser(String userId) {
        return this.withParsedId(userId,
                id -> DatabaseManager.createEntityManager()
                        .createNamedQuery("Order.findByUser", Order.class)
                        .setParameter("userId", id)
                        .getResultList());
    }

    public List<Order> get(String orderId, String userId, String orderedItemId, HttpServletResponse response) {
        return this.getIf(
                new MapBuilder<String, Function<String, List<Order>>>()
                        .buildPut(orderId, this::get)
                        .buildPut(orderedItemId, this::findByOrderedItem)
                        .buildPut(userId, this::findByUser),
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

    private List<Predicate> search(CriteriaBuilder builder, Root<Order> root, Filter.FilterRequest filterRequest) {
        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<Order> orderEntityType = metamodel.entity(Order.class);
        EntityType<OrderedItem> orderedItemEntityType = metamodel.entity(OrderedItem.class);
        EntityType<ShopItem> shopItemEntityType = metamodel.entity(ShopItem.class);
        EntityType<Color> colorEntityType = metamodel.entity(Color.class);

        ListJoin<Order, OrderedItem> itemListJoin = root.join(orderEntityType.getList("items", OrderedItem.class));

        Join<OrderedItem, ShopItem> itemJoin = itemListJoin.join(orderedItemEntityType.getSingularAttribute("item", ShopItem.class));
        Join<OrderedItem, Color> colorJoin = itemListJoin.join(orderedItemEntityType.getSingularAttribute("color", Color.class), JoinType.LEFT);

        Predicate colorMatchers = filterRequest.getValues().stream()
                .map(value ->
                        builder.like(
                                builder.upper(colorJoin.get(colorEntityType.getSingularAttribute("name", String.class))),
                                "%" + value.trim().toUpperCase() + "%")
                )
                .reduce(builder::and).orElse(PredicateFactory.isTrue(builder));

        Predicate descriptionMatcher = filterRequest.getValues().stream()
                .map(value ->
                        builder.or(
                                builder.like(
                                        builder.upper(itemListJoin.get(orderedItemEntityType.getSingularAttribute("description", String.class))),
                                        "%" + value.trim().toUpperCase() + "%"
                                ),
                                builder.like(
                                        builder.upper(itemListJoin.get(orderedItemEntityType.getSingularAttribute("size", String.class))),
                                        "%" + value.trim().toUpperCase() + "%"
                                )
                        )
                )
                .reduce(builder::and).orElse(PredicateFactory.isTrue(builder));

        Predicate itemTitleMatchers = filterRequest.getValues().stream()
                .map(value -> builder.like(
                        builder.upper(itemJoin.get(shopItemEntityType.getSingularAttribute("title", String.class))),
                        "%" + value.trim().toUpperCase() + "%")
                )
                .reduce(builder::and).orElse(PredicateFactory.isTrue(builder));

        List<Predicate> predicates = Arrays.asList(itemTitleMatchers, descriptionMatcher, colorMatchers);

        return Collections.singletonList(
                PredicateFactory.combineByOr(
                        builder,
                        predicates
                )
        );
    }


    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Order> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<Order>()
                .buildPut("userId", PredicateFactory
                        .getIdSupplier("user", "id")
                )
                .buildPut("eventId", (b, r, request) -> Collections.singletonList(
                        PredicateFactory.anyIsMember(b, r,
                                orderPath -> PredicateFactory.get(orderPath, "items", "item", "id"),
                                request.getValues()
                        )
                ))
                .buildPut("status", (b, r, request) -> Collections.singletonList(
                        PredicateFactory.anyIsMember(b, r,
                                orderPath -> PredicateFactory.get(orderPath, "items", "status"),
                                request.getValues(),
                                s -> OrderStatus.fromOrdinal(Integer.valueOf(s))
                        ))
                )
                .buildPut("method", PredicateFactory.
                        getSupplier(
                                orderPath -> PredicateFactory.get(orderPath, "method"),
                                PaymentMethod::fromTextValue
                        )
                )
                .buildPut("searchTerm", this::search)
                .buildPut("orderedItemId", this::getByOrderedItemId)
        );
    }


}
