package memo.data;

import memo.auth.api.strategy.StockAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.Stock;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class StockRepository extends AbstractPagingAndSortingRepository<Stock> {
    private StockAuthStrategy stockAuthStrategy;

    public StockRepository() {
        super(Stock.class);
    }

    @Inject
    public StockRepository(StockAuthStrategy stockAuthStrategy){
        super(Stock.class);
        this.stockAuthStrategy = stockAuthStrategy;
    }

    @PostConstruct
    public void init(){
        authenticationStrategy = stockAuthStrategy;
    }


    public List<Stock> findByShopItemType(Integer type) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("Stock.findByShopItemType", Stock.class)
                .setParameter("typ", type)
                .getResultList();
    }

    public List<Stock> findByShopItem(String eventId) throws NumberFormatException {
        Integer id = Integer.parseInt(eventId);

        List<Stock> stockItems = DatabaseManager.createEntityManager()
                .createNamedQuery("Stock.findByShopItem", Stock.class)
                .setParameter("id", id)
                .getResultList();

        //to avoid .stream() returning nothing because of the indirect list implementation of jpa
        stockItems = new ArrayList<>(stockItems);

        return stockItems.stream()
                .peek(item -> {
                    Long howManyItemsWereBought = DatabaseManager.createEntityManager()
                            .createNamedQuery("Stock.boughtAmount", Long.class)
                            .setParameter("id", item.getId())
                            .getSingleResult();

                    Integer newAmount = item.getAmount() - howManyItemsWereBought.intValue();

                    item.setAmount(newAmount);
                })
                .collect(Collectors.toList());
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
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<Stock>()
                //todo
                .buildPut("eventId", PredicateFactory.getSupplier("item", "id"))
                .buildPut("type", PredicateFactory.getSupplier("item", "type"))
        );
    }
}
