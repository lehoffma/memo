package memo.data;

import memo.api.EventServlet;
import memo.auth.api.EntryAuthStrategy;
import memo.model.Entry;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

public class EntryRepository extends AbstractPagingAndSortingRepository<Entry> {

    private static final Logger logger = Logger.getLogger(EntryRepository.class);
    private static EntryRepository instance;

    private EntryRepository() {
        super(Entry.class, new EntryAuthStrategy());
    }

    public static EntryRepository getInstance() {
        if (instance == null) instance = new EntryRepository();
        return instance;
    }


    public List<Entry> findByEventId(String SeventId) {
        try {
            Integer id = Integer.parseInt(SeventId);

            return DatabaseManager.createEntityManager()
                    .createNamedQuery("Entry.findByEventId", Entry.class)
                    .setParameter("Id", id)
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
        }
        return null;
    }

    public List<Entry> findByEventType(Integer type) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("Entry.findByType", Entry.class)
                .setParameter("type", type)
                .getResultList();
    }

    public List<Entry> get(String Sid, String SeventId, String sType, HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<Entry>>>()
                        .buildPut(Sid, this::get)
                        .buildPut(SeventId, this::findByEventId)
                        .buildPut(sType, s -> this.findByEventType(EventServlet.getType(sType))),
                this.getAll()
        );
    }

    @Override
    public List<Entry> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e", Entry.class).getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Entry> root, Filter.FilterRequest filterRequest) {
        switch (filterRequest.getKey()) {
            case "id":
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), Integer.valueOf(filterRequest.getValue()))
                );
            case "eventId":
                return null;
            case "eventType":
                return null;
            case "minDate":
                return null;
            case "maxDate":
                return null;
            default:
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), filterRequest.getValue())
                );
        }
    }
}
