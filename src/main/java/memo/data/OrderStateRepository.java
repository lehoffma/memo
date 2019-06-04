package memo.data;

import memo.model.ClubRole;
import memo.model.ShopItem;
import memo.util.DatabaseManager;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class OrderStateRepository {

    private final String openOrdersSql = "SELECT count(*) AS open,\n" +
            "       sum(case\n" +
            "               when (YEAR(o.TIMESTAMP) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND\n" +
            "                     MONTH(o.TIMESTAMP) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)) THEN 1\n" +
            "               else 0 end) AS openChange\n" +
            "FROM orders o,\n" +
            "     ordered_items item\n" +
            "where o.ID = item.ORDER_ID AND item.STATUS NOT IN (4,5,6,9)";

    public OpenOrdersState openOrders() {
        Object[] result = (Object[]) DatabaseManager.createEntityManager()
                .createNativeQuery(openOrdersSql)
                .getSingleResult();

        return new OpenOrdersState(result);
    }

    public static class OpenOrdersState {
        private Long open;
        private Long openChange;

        public OpenOrdersState(){}
        public OpenOrdersState(Object[] objects){
            this.open = (Long) objects[0];
            this.openChange = (Long) objects[0];
        }

        public Long getOpen() {
            return open;
        }

        public OpenOrdersState setOpen(Long open) {
            this.open = open;
            return this;
        }

        public Long getOpenChange() {
            return openChange;
        }

        public OpenOrdersState setOpenChange(Long openChange) {
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
        Object[] result = (Object[]) DatabaseManager.createEntityManager()
                .createNativeQuery(totalOrdersSql)
                .getSingleResult();

        return new TotalOrdersState(result);
    }


    public static class TotalOrdersState {
        private Long total;
        private Long totalChange;
        public TotalOrdersState(){}
        public TotalOrdersState(Object[] objects){
            this.total = (Long) objects[0];
            this.totalChange = (Long) objects[0];
        }

        public Long getTotal() {
            return total;
        }

        public TotalOrdersState setTotal(Long total) {
            this.total = total;
            return this;
        }

        public Long getTotalChange() {
            return totalChange;
        }

        public TotalOrdersState setTotalChange(Long totalChange) {
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

        return ((List<Object[]>) DatabaseManager.createEntityManager()
                .createNativeQuery(ordersOverTimeSql)
                .setParameter(1, fromTimestamp)
                .setParameter(2, toTimestamp)
                .getResultList()).stream()
                .map(DataPoint::new)
                .collect(Collectors.toList());
    }

    public static class DataPoint {
        private String timestamp;
        private Long amount;

        public DataPoint(){}
        public DataPoint(Object[] objects){
            this.amount = (Long) objects[0];
            this.timestamp = (String) objects[1];
        }

        public String getTimestamp() {
            return timestamp;
        }

        public DataPoint setTimestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Long getAmount() {
            return amount;
        }

        public DataPoint setAmount(Long amount) {
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
        return ((List<Object[]>) DatabaseManager.createEntityManager()
                .createNativeQuery(popularItemsSql)
                .getResultList()).stream()
                .map(PopularItemsDataPoint::new)
                .collect(Collectors.toList());
    }

    public static class PopularItemsDataPoint{
        private Long amount;
        private Integer id;

        public PopularItemsDataPoint(){}
        public PopularItemsDataPoint(Object[] objects){
            this.amount = (Long) objects[0];
            this.id = (Integer) objects[1];
        }

        public Long getAmount() {
            return amount;
        }

        public PopularItemsDataPoint setAmount(Long amount) {
            this.amount = amount;
            return this;
        }

        public Integer getId() {
            return id;
        }

        public PopularItemsDataPoint setId(Integer id) {
            this.id = id;
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
        return ((List<Object[]>) DatabaseManager.createEntityManager()
                .createNativeQuery(popularColorsSql)
                .getResultList()).stream()
                .map(PopularColorsDataPoint::new)
                .collect(Collectors.toList());
    }

    public static class PopularColorsDataPoint {
        private String name;
        private String hex;
        private Long amount;

        public PopularColorsDataPoint(){}
        public PopularColorsDataPoint(Object[] objects){
            this.amount = (Long) objects[0];
            this.name = (String) objects[1];
            this.hex = (String) objects[2];
        }

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

        public Long getAmount() {
            return amount;
        }

        public PopularColorsDataPoint setAmount(Long amount) {
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
        return ((List<Object[]>) DatabaseManager.createEntityManager()
                .createNativeQuery(popularSizesSql)
                .getResultList()).stream()
                .map(PopularSizesDataPoint::new)
                .collect(Collectors.toList());
    }

    public static class PopularSizesDataPoint {
        private String size;
        private Long amount;


        public PopularSizesDataPoint(){}
        public PopularSizesDataPoint(Object[] objects){
            this.amount = (Long) objects[0];
            this.size = (String) objects[1];
        }

        public String getSize() {
            return size;
        }

        public PopularSizesDataPoint setSize(String size) {
            this.size = size;
            return this;
        }

        public Long getAmount() {
            return amount;
        }

        public PopularSizesDataPoint setAmount(Long amount) {
            this.amount = amount;
            return this;
        }
    }
}
