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
}
