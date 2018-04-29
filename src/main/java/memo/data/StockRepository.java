package memo.data;

import memo.auth.api.StockAuthStrategy;
import memo.model.Stock;
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

public class StockRepository extends AbstractPagingAndSortingRepository<Stock> {

    private static final Logger logger = Logger.getLogger(StockRepository.class);
    private static StockRepository instance;

    private StockRepository() {
        super(Stock.class, new StockAuthStrategy());
    }

    public static StockRepository getInstance() {
        if (instance == null) instance = new StockRepository();
        return instance;
    }


    public List<Stock> findByShopItemType(Integer type) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("Stock.findByShopItemType", Stock.class)
                .setParameter("typ", type)
                .getResultList();
    }

    public List<Stock> findByShopItem(String eventId) throws NumberFormatException {
        Integer id = Integer.parseInt(eventId);

        return DatabaseManager.createEntityManager()
                .createNamedQuery("Stock.findByShopItem", Stock.class)
                .setParameter("id", id)
                .getResultList();
    }


    public List<Stock> get(String eventId, String type, HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<Stock>>>()
                        .buildPut(eventId, this::findByShopItem)
                        .buildPut(type, s -> this.findByShopItemType(Integer.valueOf(type))),
                this.getAll());
    }

    @Override
    public List<Stock> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s ", Stock.class)
                .getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Stock> root, Filter.FilterRequest filterRequest) {
        /*
                        getParameter(paramMap, "eventId"),
                        getParameter(paramMap, "type"),
         */
        switch (filterRequest.getKey()) {
            case "id":
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), Integer.valueOf(filterRequest.getValue()))
                );
            case "eventId":
                return null;
            case "type":
                return null;
            default:
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), filterRequest.getValue())
                );
        }
    }
}
