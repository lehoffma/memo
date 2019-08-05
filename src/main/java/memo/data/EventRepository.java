package memo.data;

import memo.auth.api.strategy.ShopItemAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.*;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.EntityManager;
import javax.persistence.criteria.*;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static memo.data.util.PredicateFactory.getBounded;
import static memo.data.util.PredicateFactory.getTransform;

@Named
@ApplicationScoped
public class EventRepository extends AbstractPagingAndSortingRepository<ShopItem> {
    private ShopItemAuthStrategy shopItemAuthStrategy;

    public EventRepository() {
        super(ShopItem.class);
    }

    @Inject
    public EventRepository(ShopItemAuthStrategy shopItemAuthStrategy) {
        super(ShopItem.class);
        this.shopItemAuthStrategy = shopItemAuthStrategy;
    }

    @PostConstruct
    public void init() {
        authenticationStrategy = shopItemAuthStrategy;
    }

    public List<ShopItem> findBySearchTerm(String searchTerm, Integer type) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("ShopItem.findBySearchTerm", ShopItem.class)
                .setParameter("type", type)
                .setParameter("searchTerm", searchTerm)
                .getResultList();
    }

    public List<ShopItem> findByType(Integer type) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("ShopItem.findByType", ShopItem.class)
                .setParameter("type", type)
                .getResultList();
    }

    public List<ShopItem> findByParticipant(Integer userId) {
        List<ShopItem> orderedItems = DatabaseManager.createEntityManager()
                .createNamedQuery("ShopItem.findByParticipant", ShopItem.class)
                .setParameter("userId", userId)
                .getResultList();
        return new ArrayList<>(orderedItems).stream()
                .distinct()
                .collect(Collectors.toList());
    }

    public List<ShopItem> findByAuthor(Integer authorId) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("ShopItem.findByAuthor", ShopItem.class)
                .setParameter("author", authorId)
                .getResultList();
    }

    public List<ShopItem> getEventsOfDay(LocalDateTime localDateTime) {
        LocalDateTime startOfDay = localDateTime.with(LocalTime.MIN);
        LocalDateTime endOfDay = localDateTime.with(LocalTime.MAX);

        Timestamp startOfDayTimestamp = Timestamp.valueOf(startOfDay);
        Timestamp endOfDayTimestamp = Timestamp.valueOf(endOfDay);

        return DatabaseManager.createEntityManager()
                .createNamedQuery("ShopItem.findByDateRange", ShopItem.class)
                .setParameter("startOfDay", startOfDayTimestamp)
                .setParameter("endOfDay", endOfDayTimestamp)
                .getResultList();
    }

    @Override
    public List<ShopItem> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e", ShopItem.class).getResultList();
    }

    /**
     * @param builder
     * @param root
     * @param userIds
     * @return
     */
    public List<Predicate> getByParticipant(CriteriaBuilder builder, Root<ShopItem> root, List<String> userIds) {
         /*
        "SELECT shopItem
                FROM Order o join OrderedItem item join ShopItem shopItem
                WHERE o.user.id =:userId AND item.item.id = shopItem.id"
         */
        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<ShopItem> shopItemEntityType = metamodel.entity(ShopItem.class);
        EntityType<OrderedItem> orderedItemEntityType = metamodel.entity(OrderedItem.class);

        ListJoin<ShopItem, OrderedItem> orderedItemJoin = root.join(shopItemEntityType.getList("orders", OrderedItem.class));
        Join<OrderedItem, memo.model.Order> orderJoin = orderedItemJoin.join(orderedItemEntityType.getSingularAttribute("order", memo.model.Order.class));

        Path<Object> orderUser = orderJoin.get("user");

        List<Predicate> userIdMatchers = userIds.stream()
                .map(value -> builder.equal(orderUser.get("id"), value))
                .collect(Collectors.toList());

        Predicate matchesAnyOfTheIds = PredicateFactory.combineByOr(builder, userIdMatchers);

        return Collections.singletonList(matchesAnyOfTheIds);
    }

    /**
     * @param builder
     * @param root
     * @param filterRequest
     * @return
     */
    private List<Predicate> getByParticipant(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        return this.getByParticipant(builder, root, filterRequest.getValues());
    }

    public List<Predicate> getByAuthorId(CriteriaBuilder builder, Root<ShopItem> root, User user) {
        Filter.FilterRequest request = new Filter().request("authorId", user.getId().toString());
        return this.getByAuthorId(builder, root, request);
    }

    /**
     * @param builder
     * @param root
     * @param filterRequest
     * @return
     */
    private List<Predicate> getByAuthorId(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        /*
        "SELECT distinct e FROM ShopItem e JOIN e.author a WHERE a.id = :author"
         */

        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<ShopItem> shopItemEntityType = metamodel.entity(ShopItem.class);
        ListJoin<ShopItem, User> itemAuthorJoin = root.join(shopItemEntityType.getList("author", User.class));
        Path<Object> idOfAuthor = itemAuthorJoin.get("id");

        List<Predicate> idMatchers = filterRequest.getValues().stream()
                .map(value -> builder.equal(idOfAuthor, value))
                .collect(Collectors.toList());

        Predicate anyIdMatches = PredicateFactory.combineByOr(builder, idMatchers);
        return Collections.singletonList(anyIdMatches);
    }

    private List<Predicate> getByColor(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<ShopItem> shopItemEntityType = metamodel.entity(ShopItem.class);
        EntityType<Stock> stockEntityType = metamodel.entity(Stock.class);

        ListJoin<ShopItem, Stock> stockListJoin = root.join(shopItemEntityType.getList("stock", Stock.class));
        Join<Stock, Color> colorJoin = stockListJoin.join(stockEntityType.getSingularAttribute("color", Color.class));

        List<Predicate> sizeMatchers = filterRequest.getValues().stream()
                .map(value -> builder.equal(colorJoin.get("name"), value))
                .collect(Collectors.toList());

        return Collections.singletonList(
                PredicateFactory.combineByOr(
                        builder,
                        sizeMatchers
                )
        );
    }


    private List<Predicate> getBySize(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<ShopItem> shopItemEntityType = metamodel.entity(ShopItem.class);
        ListJoin<ShopItem, Stock> stockListJoin = root.join(shopItemEntityType.getList("stock", Stock.class));

        List<Predicate> sizeMatchers = filterRequest.getValues().stream()
                .map(value -> builder.equal(stockListJoin.get("size"), value))
                .collect(Collectors.toList());

        return Collections.singletonList(
                PredicateFactory.combineByOr(
                        builder,
                        sizeMatchers
                )
        );
    }

    private List<Predicate> minMaxOverwrite(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        Function<String, Timestamp> transform = (Function<String, Timestamp>) getTransform(filterRequest.getKey());
        Predicate bounded = getBounded(builder, root, filterRequest, transform).get(0);

        Optional<Path<Integer>> type = PredicateFactory.get(root, "type");
        Predicate isMerch = type.map(it -> builder.equal(it, 3)).orElse(PredicateFactory.isFalse(builder));

        return Collections.singletonList(
                builder.or(
                        isMerch,
                        bounded
                )
        );
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<ShopItem>()
                .buildPut("searchTerm", (b, r, request) -> PredicateFactory
                        .search(b, r, request, Collections.singletonList("title"))
                )
                //overwrite min/max date to specify that merch's date will be ignored
                .buildPut("minDate", this::minMaxOverwrite)
                .buildPut("maxDate", this::minMaxOverwrite)
                .buildPut("userId", this::getByParticipant)
                .buildPut("authorId", this::getByAuthorId)
                .buildPut("size", this::getBySize)
                .buildPut("color", this::getByColor)
        );
    }
}
