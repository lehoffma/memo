package memo.data;

import memo.api.EventServlet;
import memo.auth.api.strategy.EntryAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.Entry;
import memo.model.management.AccountingState;
import memo.model.management.ItemAccountingSummary;
import memo.model.management.MonthAccountingSummary;
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
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class EntryRepository extends AbstractPagingAndSortingRepository<Entry> {
    private static final Logger logger = LogManager.getLogger(EntryRepository.class);

    public EntryRepository() {
        super(Entry.class);
    }

    @Inject
    public EntryRepository(EntryAuthStrategy entryAuthStrategy) {
        super(Entry.class);
        this.authenticationStrategy = entryAuthStrategy;
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

    private final String stateQuery = "SELECT sum(e.ACTUALVALUE)                                         AS currentBalance,\n" +
            "       sum(case\n" +
            "             when (YEAR(e.DATE) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                   MONTH(e.DATE) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN e.ACTUALVALUE\n" +
            "             else 0 end)                                          AS lastMonthChange,\n" +
            "\n" +
            "       sum(case when item.type = 1 then e.ACTUALVALUE else 0 end) AS tourTotal,\n" +
            "       sum(case\n" +
            "             when (item.type = 1 AND YEAR(e.DATE) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                   MONTH(e.DATE) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN e.ACTUALVALUE\n" +
            "             else 0 end)                                          AS tourChange,\n" +
            "\n" +
            "       sum(case when item.type = 2 then e.ACTUALVALUE else 0 end) AS partyTotal,\n" +
            "       sum(case\n" +
            "             when (item.type = 2 AND YEAR(e.DATE) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                   MONTH(e.DATE) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN e.ACTUALVALUE\n" +
            "             else 0 end)                                          AS partyChange,\n" +
            "\n" +
            "       sum(case when item.type = 3 then e.ACTUALVALUE else 0 end) AS merchTotal,\n" +
            "       sum(case\n" +
            "             when (item.type = 3 AND YEAR(e.DATE) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                   MONTH(e.DATE) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN e.ACTUALVALUE\n" +
            "             else 0 end)                                          AS merchChange\n" +
            "\n" +
            "FROM ENTRIES e,\n" +
            "     SHOP_ITEMS item\n" +
            "WHERE e.ITEM_ID = item.ID;";

    private final String monthlyChangesQuery = "SELECT SUM(e.ACTUALVALUE) AS totalBalance, MONTH(e.DATE) AS month, YEAR(e.DATE) AS year\n" +
            "FROM ENTRIES e\n" +
            "GROUP BY YEAR(e.DATE), month;";

    private final String itemTotalsQuery = "SELECT SUM(e.ACTUALVALUE) AS totalBalance, item.TITLE AS itemTitle, item.ID AS itemId\n" +
            "FROM ENTRIES e,\n" +
            "     SHOP_ITEMS item\n" +
            "WHERE e.ITEM_ID = item.ID\n" +
            "  AND item.DATE <= CURRENT_DATE\n" +
            "GROUP BY e.ITEM_ID\n" +
            "ORDER BY item.DATE DESC LIMIT 3";

    private final String incomeByCategoryQuery = "SELECT category.NAME as categoryName,\n" +
            "       (\n" +
            "           SELECT sum(e.ACTUALVALUE)\n" +
            "           FROM entries e\n" +
            "           WHERE e.ACTUALVALUE >= 0\n" +
            "             AND category.ID = e.CATEGORY_ID\n" +
            "       )             as sum\n" +
            "from entry_categories category";

    private final String expensesByCategoryQuery = "SELECT category.NAME as categoryName,\n" +
            "       (\n" +
            "           SELECT sum(e.ACTUALVALUE)\n" +
            "           FROM entries e\n" +
            "           WHERE e.ACTUALVALUE < 0\n" +
            "             AND category.ID = e.CATEGORY_ID\n" +
            "       )             as sum\n" +
            "from entry_categories category";

    public AccountingState state() {
        Object accountingState = DatabaseManager.createEntityManager()
                .createNativeQuery(stateQuery)
                .getSingleResult();

        AccountingState state = new AccountingState((Object[]) accountingState);

        List<Object[]> monthlyChangesResult = new ArrayList<Object[]>(DatabaseManager.createEntityManager()
                .createNativeQuery(monthlyChangesQuery)
                .getResultList());

        List<MonthAccountingSummary> monthlyChanges = monthlyChangesResult.stream()
                .map(MonthAccountingSummary::new)
                .collect(Collectors.toList());


        List<Object[]> itemTotalsResult = new ArrayList<Object[]>(DatabaseManager.createEntityManager()
                .createNativeQuery(itemTotalsQuery)
                .getResultList());
        List<ItemAccountingSummary> itemTotals = itemTotalsResult.stream()
                .map(ItemAccountingSummary::new)
                .collect(Collectors.toList());

        state.setMonthlyChanges(monthlyChanges);
        state.setItemTotals(itemTotals);

        List<Object[]> incomeByCategoryResult = new ArrayList<>(DatabaseManager.createEntityManager()
                .createNativeQuery(incomeByCategoryQuery)
                .getResultList()
        );
        state.setIncomeByCategory(incomeByCategoryResult);

        List<Object[]> expensesByCategoryResult = new ArrayList<>(DatabaseManager.createEntityManager()
                .createNativeQuery(expensesByCategoryQuery)
                .getResultList()
        );
        state.setExpensesByCategory(expensesByCategoryResult);

        state.fillUpMonths();

        return state;
    }

    public List<Entry> get(String id, String eventId, String type, HttpServletResponse response) {
        return this.getIf(new MapBuilder<String, Function<String, List<Entry>>>()
                        .buildPut(id, this::get)
                        .buildPut(eventId, this::findByEventId)
                        .buildPut(type, s -> this.findByEventType(EventServlet.getType(type))),
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
                .buildPut("eventId", PredicateFactory
                        .getIdSupplier("item", "id"))
                //"SELECT e FROM Entry e WHERE e.item.type = :type"
                .buildPut("eventType", PredicateFactory
                        .getSupplier("item", "type"))
                .buildPut("entryType", PredicateFactory
                        .getSupplier("category", "name"))
        );
    }
}
