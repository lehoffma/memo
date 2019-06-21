package memo.data;

import memo.model.management.StockState;
import memo.util.DatabaseManager;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;

@Named
@ApplicationScoped
public class StockStateRepository {

    private final String stockStateSql = "SELECT sum(case\n" +
            "               when s.AMOUNT = 0 then 1\n" +
            "               else 0 end) AS soldOut,\n" +
            "       sum(case\n" +
            "               when (s.AMOUNT < 5) then 1\n" +
            "               else 0 end) AS warning,\n" +
            "       sum(case\n" +
            "               when s.AMOUNT >= 5 then 1\n" +
            "               else 0 end) AS ok\n" +
            "FROM stock s";

    public StockState getState() {
        Object[] result = (Object[]) DatabaseManager.createEntityManager()
                .createNativeQuery(stockStateSql)
                .getSingleResult();

        return new StockState(result);
    }
}
