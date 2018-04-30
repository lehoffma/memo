package memo.data;

import memo.api.EventServlet;
import memo.auth.api.strategy.EntryAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.Entry;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
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
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<Entry>()
                //"SELECT e FROM Entry e WHERE e.item.id = :Id"
                .buildPut("eventId", PredicateFactory.getIdSupplier(entryRoot -> entryRoot.get("item").get("id")))
                //"SELECT e FROM Entry e WHERE e.item.type = :type"
                .buildPut("eventType", PredicateFactory.getSupplier(entryRoot -> entryRoot.get("item").get("type")))
                .buildPut("minDate", (b, r, request) -> PredicateFactory
                        .minDate(b, r, request, entryRoot -> entryRoot.get("date"))
                )
                .buildPut("maxDate", (b, r, request) -> PredicateFactory
                        .maxDate(b, r, request, entryRoot -> entryRoot.get("date"))
                )
        );
    }
}
