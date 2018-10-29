package memo.data;

import memo.auth.api.strategy.ParticipantsAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.OrderStatus;
import memo.model.OrderedItem;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

@Named
@ApplicationScoped
public class ParticipantRepository extends AbstractPagingAndSortingRepository<OrderedItem> {
    private static final Logger logger = LogManager.getLogger(ParticipantRepository.class);

    public ParticipantRepository() {
        super(OrderedItem.class);
    }

    @Inject
    public ParticipantRepository(ParticipantsAuthStrategy participantsAuthStrategy) {
        super(OrderedItem.class);
        this.authenticationStrategy = participantsAuthStrategy;
    }


    public List<OrderedItem> getParticipants() {
        return this.getAll();
    }


    public List<OrderedItem> findByEvent(Integer id) {
        //ToDo: gibt null aus wenn id nicht vergeben
        return DatabaseManager.createEntityManager()
                .createNamedQuery("OrderedItem.findByEvent", OrderedItem.class)
                .setParameter("id", id)
                .getResultList();
    }

    public List<OrderedItem> findByUserAndEvent(Integer userId, Integer eventId) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("OrderedItem.findByEventAndUser", OrderedItem.class)
                .setParameter("eventId", eventId)
                .setParameter("userId", userId)
                .getResultList();
    }

    public List<OrderedItem> findByEvent(String eventId) throws NumberFormatException {
        Integer id = Integer.parseInt(eventId);
        return findByEvent(id);
    }


    public List<OrderedItem> findByEvent(String eventId, HttpServletResponse response) {
        try {
            return findByEvent(eventId);
        } catch (NumberFormatException e) {
            logger.error("Could not parse event ID value", e);
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try {
                response.getWriter().append("Bad ID value");
            } catch (IOException exc) {
                logger.error("Could not write to response", exc);
            }
        }
        return new ArrayList<>();
    }

    public List<OrderedItem> get(String id, String eventId, HttpServletResponse response) {
        return this.getIf(
                new MapBuilder<String, Function<String, List<OrderedItem>>>()
                        .buildPut(id, this::get)
                        .buildPut(eventId, s -> this.findByEvent(s, response)),
                this.getAll()
        );
    }


    @Override
    public List<OrderedItem> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o ", OrderedItem.class)
                .getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<OrderedItem> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<OrderedItem>()
                .buildPut("eventId", PredicateFactory
                        .getIdSupplier("item", "id")
                )
                .buildPut("status", (b, r, request) -> Collections.singletonList(
                        PredicateFactory.anyIsMember(b, r,
                                itemPath -> PredicateFactory.get(itemPath, "status"),
                                request.getValues(),
                                s -> OrderStatus.fromOrdinal(Integer.valueOf(s))
                        ))
                )
        );
    }
}
