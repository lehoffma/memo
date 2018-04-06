package memo.data;

import memo.model.OrderedItem;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public class ParticipantRepository extends AbstractRepository<OrderedItem> {

    private static final Logger logger = Logger.getLogger(ParticipantRepository.class);
    private static ParticipantRepository instance;

    private ParticipantRepository() {
        super(OrderedItem.class);
    }

    public static ParticipantRepository getInstance() {
        if (instance == null) instance = new ParticipantRepository();
        return instance;
    }

    public List<OrderedItem> getParticipants() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o ", OrderedItem.class)
                .getResultList();
    }

    public List<OrderedItem> getParticipantsByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o " +
                " WHERE o.item.type = :typ", OrderedItem.class)
                .setParameter("typ", type)
                .getResultList();
    }

    public List<OrderedItem> getParticipantsByEventId(String eventId) throws NumberFormatException {
        Integer id = Integer.parseInt(eventId);
        return getParticipantsByEventId(id);
    }


    public List<OrderedItem> getParticipantsByEventId(Integer id) {
        //ToDo: gibt null aus wenn id nicht vergeben
        return DatabaseManager.createEntityManager().createQuery("SELECT DISTINCT o FROM OrderedItem o " +
                " WHERE o.item.id = :id", OrderedItem.class)
                .setParameter("id", id)
                .getResultList();
    }

    public List<OrderedItem> getParticipantsByEventId(String eventId, HttpServletResponse response) {
        try {
            return ParticipantRepository.getInstance().getParticipantsByEventId(eventId);
        } catch (NumberFormatException e) {
            logger.error("Could not parse event ID value");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try {
                response.getWriter().append("Bad ID value");
            } catch (IOException exc) {
                logger.error("Could not write to response");
                exc.printStackTrace();
            }
        }
        return new ArrayList<>();
    }

    public List<OrderedItem> get(String eventId, HttpServletResponse response) {
        return this.getIf(
                new MapBuilder<String, Function<String, List<OrderedItem>>>()
                        .buildPut(eventId, s -> this.getParticipantsByEventId(s, response)),
                this.getAll()
        );
    }


    @Override
    public List<OrderedItem> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o ", OrderedItem.class)
                .getResultList();
    }
}
