package memo.data;

import memo.api.EventServlet;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class EventRepository extends AbstractRepository<ShopItem> {

    private static final Logger logger = Logger.getLogger(EventRepository.class);
    private static EventRepository instance;

    private EventRepository() {
        super(ShopItem.class);
    }

    public static EventRepository getInstance() {
        if (instance == null) instance = new EventRepository();
        return instance;
    }

    public List<ShopItem> getEventsBySearchTerm(String searchTerm, Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e " +
                " WHERE e.type = :type " +
                "       AND (UPPER(e.title) LIKE UPPER(:searchTerm) " +
                "              OR UPPER(e.description) LIKE UPPER(:searchTerm))", ShopItem.class)
                .setParameter("type", type)
                .setParameter("searchTerm", "%" + searchTerm + "%")
                .getResultList();
    }

    public List<ShopItem> getEventsByType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e " +
                " WHERE e.type = :type", ShopItem.class)
                .setParameter("type", type)
                .getResultList();
    }

    public List<ShopItem> getEventsByUser(Integer userId) {
        return DatabaseManager.createEntityManager().createQuery(
                "SELECT item from Order o join OrderedItem item \n" +
                        "    WHERE o.user.id =:userId", OrderedItem.class)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .map(OrderedItem::getItem)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<ShopItem> getEventsByAuthor(Integer authorId) {
        return DatabaseManager.createEntityManager().createQuery("SELECT distinct e FROM ShopItem e " +
                " JOIN e.author a WHERE a.id = :author", ShopItem.class)
                .setParameter("author", authorId)
                .getResultList();
    }

    public List<ShopItem> get(String eventId, String searchTerm, String eventType, String userId, String authorId,
                              HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<ShopItem>>>()
                        .buildPut(eventId, this::get)
                        .buildPut(searchTerm, it -> this.getEventsBySearchTerm(searchTerm, EventServlet.getType(eventType)))
                        .buildPut(eventType, s -> {
                            if (searchTerm == null) {
                                return this.getEventsByType(EventServlet.getType(s));
                            }
                            return new ArrayList<>();
                        })
                        .buildPut(userId, s -> this.getEventsByUser(Integer.valueOf(s)))
                        .buildPut(authorId, s -> this.getEventsByAuthor(Integer.valueOf(s))),
                this.getAll());
    }

    @Override
    public List<ShopItem> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e", ShopItem.class).getResultList();
    }
}
