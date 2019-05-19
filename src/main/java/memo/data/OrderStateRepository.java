package memo.data;

import memo.model.ShopItem;
import memo.util.DatabaseManager;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Named
@ApplicationScoped
public class OrderStateRepository {


    //___ state related stuff starts here ___

    private final String openOrdersSql = "SELECT count(*) AS open,\n" +
            "       sum(case\n" +
            "               when (YEAR(o.TIMESTAMP) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                     MONTH(o.TIMESTAMP) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN 1\n" +
            "               else 0 end) AS openChange\n" +
            "FROM orders o,\n" +
            "     ordered_items item\n" +
            "where o.ID = item.ORDER_ID AND item.STATUS NOT IN (4,5,6,9)";

    public OpenOrdersState openOrders() {
        return (OpenOrdersState) DatabaseManager.createEntityManager()
                .createNativeQuery(openOrdersSql)
                .getSingleResult();
    }

    public static class OpenOrdersState {
        private Integer open;
        private Integer openChange;

        public Integer getOpen() {
            return open;
        }

        public OpenOrdersState setOpen(Integer open) {
            this.open = open;
            return this;
        }

        public Integer getOpenChange() {
            return openChange;
        }

        public OpenOrdersState setOpenChange(Integer openChange) {
            this.openChange = openChange;
            return this;
        }
    }

    private final String totalOrdersSql = "SELECT count(*)            AS total,\n" +
            "       sum(case\n" +
            "               when (YEAR(o.TIMESTAMP) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                     MONTH(o.TIMESTAMP) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN 1\n" +
            "               else 0 end) AS totalChange\n" +
            "FROM orders o";

    public TotalOrdersState totalOrders() {
        return (TotalOrdersState) DatabaseManager.createEntityManager()
                .createNativeQuery(totalOrdersSql)
                .getSingleResult();
    }


    public static class TotalOrdersState{
        private Integer total;
        private Integer totalChange;

        public Integer getTotal() {
            return total;
        }

        public TotalOrdersState setTotal(Integer total) {
            this.total = total;
            return this;
        }

        public Integer getTotalChange() {
            return totalChange;
        }

        public TotalOrdersState setTotalChange(Integer totalChange) {
            this.totalChange = totalChange;
            return this;
        }
    }


    private final String ordersOverTimeSql = "SELECT count(*) as amount, CONCAT(DATE_FORMAT(o.TIMESTAMP, '%Y-%m-%d'), 'T00:00:00Z') as timestamp\n" +
            "    from orders o\n" +
            "    WHERE o.TIMESTAMP > ?1 AND o.TIMESTAMP < ?2\n" +
            "    group by EXTRACT(DAY FROM o.TIMESTAMP)";

    public List<DataPoint> ordersOverTime(LocalDateTime from, LocalDateTime to) {
        Timestamp fromTimestamp = Timestamp.valueOf(from);
        Timestamp toTimestamp = Timestamp.valueOf(to);

        return (List<DataPoint>) DatabaseManager.createEntityManager()
                .createNativeQuery(ordersOverTimeSql)
                .setParameter(1, fromTimestamp)
                .setParameter(2, toTimestamp)
                .getResultList();
    }

    public static class DataPoint {
        private String timestamp;
        private Integer amount;

        public String getTimestamp() {
            return timestamp;
        }

        public DataPoint setTimestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Integer getAmount() {
            return amount;
        }

        public DataPoint setAmount(Integer amount) {
            this.amount = amount;
            return this;
        }
    }

    private final String popularItemsSql = "SELECT count(*) AS count, shop_item.*\n" +
            "FROM orders o, ordered_items item, shop_items shop_item\n" +
            "where o.ID = item.ORDER_ID AND item.ITEM_ID = shop_item.ID\n" +
            "GROUP BY item.ITEM_ID\n" +
            "ORDER BY count DESC";

    public List<PopularItemsDataPoint> popularItems() {
        return (List<PopularItemsDataPoint>) DatabaseManager.createEntityManager()
                .createNativeQuery(popularItemsSql)
                .getResultList();
    }

    public static class PopularItemsDataPoint extends ShopItem {
        private Integer amount;

        public Integer getAmount() {
            return amount;
        }

        public PopularItemsDataPoint setAmount(Integer amount) {
            this.amount = amount;
            return this;
        }
    }

    private final String popularColorsSql = "\n" +
            "SELECT count(*) AS count, color.NAME as name, color.HEX as hex\n" +
            "FROM orders o, ordered_items item, colors color\n" +
            "where o.ID = item.ORDER_ID AND item.COLOR_ID IS NOT NULL\n" +
            "GROUP BY item.COLOR_ID\n" +
            "ORDER BY count DESC";

    public List<PopularColorsDataPoint> popularColors() {
        return (List<PopularColorsDataPoint>) DatabaseManager.createEntityManager()
                .createNativeQuery(popularColorsSql)
                .getResultList();
    }

    public static class PopularColorsDataPoint {
        private String name;
        private String hex;
        private Integer amount;

        public String getName() {
            return name;
        }

        public PopularColorsDataPoint setName(String name) {
            this.name = name;
            return this;
        }

        public String getHex() {
            return hex;
        }

        public PopularColorsDataPoint setHex(String hex) {
            this.hex = hex;
            return this;
        }

        public Integer getAmount() {
            return amount;
        }

        public PopularColorsDataPoint setAmount(Integer amount) {
            this.amount = amount;
            return this;
        }
    }


    private final String popularSizesSql = "SELECT count(*) AS count, item.SIZE as size\n" +
            "FROM orders o, ordered_items item\n" +
            "where o.ID = item.ORDER_ID AND item.SIZE IS NOT NULL\n" +
            "GROUP BY item.SIZE\n" +
            "ORDER BY count DESC";

    public List<PopularSizesDataPoint> popularSizes() {
        return (List<PopularSizesDataPoint>) DatabaseManager.createEntityManager()
                .createNativeQuery(popularSizesSql)
                .getResultList();
    }

    public static class PopularSizesDataPoint {
        private String size;
        private Integer amount;

        public String getSize() {
            return size;
        }

        public PopularSizesDataPoint setSize(String size) {
            this.size = size;
            return this;
        }

        public Integer getAmount() {
            return amount;
        }

        public PopularSizesDataPoint setAmount(Integer amount) {
            this.amount = amount;
            return this;
        }
    }
}
