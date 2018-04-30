package memo.data;

import memo.api.EventServlet;
import memo.auth.api.strategy.ShopItemAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.EntityManager;
import javax.persistence.criteria.*;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class EventRepository extends AbstractPagingAndSortingRepository<ShopItem> {

    private static final Logger logger = Logger.getLogger(EventRepository.class);
    private static EventRepository instance;

    private EventRepository() {
        super(ShopItem.class, new ShopItemAuthStrategy());
    }

    public static EventRepository getInstance() {
        if (instance == null) instance = new EventRepository();
        return instance;
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
        List<OrderedItem> orderedItems = DatabaseManager.createEntityManager()
                .createNamedQuery("OrderedItem.findByUser", OrderedItem.class)
                .setParameter("userId", userId)
                .getResultList();
        return new ArrayList<>(orderedItems).stream()
                .map(OrderedItem::getItem)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<ShopItem> findByAuthor(Integer authorId) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("ShopItem.findByAuthor", ShopItem.class)
                .setParameter("author", authorId)
                .getResultList();
    }

    public List<ShopItem> get(String eventId, String searchTerm, String eventType, String userId, String authorId,
                              HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<ShopItem>>>()
                        .buildPut(eventId, this::get)
                        .buildPut(searchTerm, it -> this.findBySearchTerm(searchTerm, EventServlet.getType(eventType)))
                        .buildPut(eventType, s -> {
                            if (searchTerm == null) {
                                return this.findByType(EventServlet.getType(s));
                            }
                            return this.findBySearchTerm(searchTerm, EventServlet.getType(eventType));
                        })
                        .buildPut(userId, s -> this.findByParticipant(Integer.valueOf(s)))
                        .buildPut(authorId, s -> this.findByAuthor(Integer.valueOf(s))),
                this.getAll());
    }

    @Override
    public List<ShopItem> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e", ShopItem.class).getResultList();
    }

    private List<Predicate> getByParticipant(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
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
        Join<OrderedItem, Order> orderJoin = orderedItemJoin.join(orderedItemEntityType.getSingularAttribute("order", Order.class));

        Path<Object> orderUser = orderJoin.get("user");

        List<Predicate> userIdMatchers = filterRequest.getValues().stream()
                .map(value -> builder.equal(orderUser.get("id"), value))
                .collect(Collectors.toList());

        Predicate matchesAnyOfTheIds = PredicateFactory.combineByOr(builder, userIdMatchers);

        return Collections.singletonList(matchesAnyOfTheIds);
    }

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

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<ShopItem>()
                .buildPut("searchTerm", (b, r, request) -> PredicateFactory
                        .search(b, r, request, Arrays.asList("title", "description"))
                )
                .buildPut("userId", this::getByParticipant)
                .buildPut("authorId", this::getByAuthorId)
        );
    }
}
