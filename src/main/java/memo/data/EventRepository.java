package memo.data;

import memo.api.EventServlet;
import memo.auth.api.ShopItemAuthStrategy;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Arrays;
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

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<ShopItem> root, Filter.FilterRequest filterRequest) {
        /*
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "searchTerm"),
                        getParameter(paramMap, "type"),
                        getParameter(paramMap, "userId"),
                        getParameter(paramMap, "authorId"),
         */
        switch (filterRequest.getKey()) {
            case "id":
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), Integer.valueOf(filterRequest.getValue()))
                );
            case "searchTerm":
                return null;
            case "type":
                return null;
            case "userId":
                return null;
            case "authorId":
                return null;
            default:
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), filterRequest.getValue())
                );
        }
    }
}
