package memo.data;

import memo.api.EventServlet;
import memo.model.Entry;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.function.Function;

public class EntryRepository extends AbstractRepository<Entry> {

    private static final Logger logger = Logger.getLogger(EntryRepository.class);
    private static EntryRepository instance;

    private EntryRepository() {
        super(Entry.class);
    }

    public static EntryRepository getInstance() {
        if (instance == null) instance = new EntryRepository();
        return instance;
    }


    public List<Entry> getEntriesByEventId(String SeventId) {
        try {
            Integer id = Integer.parseInt(SeventId);

            return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e " +
                    " WHERE e.item.id = :Id", Entry.class)
                    .setParameter("Id", id)
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
        }
        return null;
    }

    public List<Entry> getEntriesByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e " +
                " WHERE e.item.type = :typ", Entry.class)
                .setParameter("typ", type)
                .getResultList();
    }

    public List<Entry> get(String Sid, String SeventId, String sType, HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<Entry>>>()
                        .buildPut(Sid, this::get)
                        .buildPut(SeventId, this::getEntriesByEventId)
                        .buildPut(sType, s -> this.getEntriesByEventType(EventServlet.getType(sType))),
                this.getAll()
        );
    }

    @Override
    public List<Entry> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e", Entry.class).getResultList();
    }
}
