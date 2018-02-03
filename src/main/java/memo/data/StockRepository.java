package memo.data;

import memo.model.Stock;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.function.Function;

public class StockRepository extends AbstractRepository<Stock> {

    private static final Logger logger = Logger.getLogger(StockRepository.class);
    private static StockRepository instance;

    private StockRepository() {
        super(Stock.class);
    }

    public static StockRepository getInstance() {
        if (instance == null) instance = new StockRepository();
        return instance;
    }


    public List<Stock> getStockByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s " +
                " WHERE s.item.type = :typ", Stock.class)
                .setParameter("typ", type)
                .getResultList();
    }

    public List<Stock> getStockByEventId(String eventId) throws NumberFormatException {
        Integer id = Integer.parseInt(eventId);
        //ToDo: gibt null aus wenn id nicht vergeben (ich bin für optionals)
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s " +
                " WHERE s.item.id = :id", Stock.class)
                .setParameter("id", id)
                .getResultList();
    }


    public List<Stock> get(String eventId, String type, HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<Stock>>>()
                        .buildPut(eventId, this::getStockByEventId)
                        .buildPut(type, s -> this.getStockByEventType(Integer.valueOf(type))),
                this.getAll());
    }

    @Override
    public List<Stock> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s ", Stock.class)
                .getResultList();
    }
}
