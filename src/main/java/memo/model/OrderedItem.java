package memo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import memo.discounts.model.DiscountEntity;
import memo.serialization.DiscountIdListDeserializer;
import memo.serialization.OrderIdDeserializer;
import memo.serialization.ShopItemIdDeserializer;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "ordered_items")
@NamedQueries({
        @NamedQuery(
                name = "OrderedItem.findByUser",
                query = "SELECT item from Order o join OrderedItem item \n" +
                        "    WHERE o.user.id = :userId"
        ),
        @NamedQuery(
                name = "OrderedItem.findByEvent",
                query = "SELECT DISTINCT o FROM OrderedItem o " +
                        " WHERE o.item.id = :id"
        ),
        @NamedQuery(
                name = "OrderedItem.findByEventAndUser",
                query = "SELECT DISTINCT item FROM Order o join OrderedItem item " +
                        "WHERE o.user.id = :userId AND item.item.id = :eventId"
        ),
        @NamedQuery(
                name = "OrderedItem.findValidByEventAndUser",
                query = "SELECT DISTINCT item FROM Order o join OrderedItem item " +
                        "WHERE o.user.id = :userId AND item.item.id = :eventId" +
                        //not cancelled
                        "   AND item.status != :cancelled"
        ),
})
public class OrderedItem implements Serializable {

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    //**************************************************************
    //  members
    //**************************************************************

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    @JsonDeserialize(using = ShopItemIdDeserializer.class)
    private ShopItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn()
    @JsonDeserialize(using = OrderIdDeserializer.class)
    private Order order;

    @ManyToMany()
    @JoinTable(name = "orderedItem_discounts",
            joinColumns = @JoinColumn(name = "orderedItem_id"),
            inverseJoinColumns = @JoinColumn(name = "discount_id")
    )
    @JsonDeserialize(using = DiscountIdListDeserializer.class)
    private List<DiscountEntity> discounts;

    private BigDecimal price = BigDecimal.valueOf(0);

    private OrderStatus status = OrderStatus.Reserved;

    @Lob
    private String description;

    private String size;

    private String name;

    private java.sql.Timestamp lastCancelTimestamp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    private Color color;

    @Column(name = "IS_DRIVER")
    private Boolean isDriver = false;

    @Column(name = "NEEDS_TICKET")
    private Boolean needsTicket = true;

    //**************************************************************
    //  constructor
    //**************************************************************

    public OrderedItem() {
        super();
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************


    public List<DiscountEntity> getDiscounts() {
        return discounts;
    }

    public OrderedItem setDiscounts(List<DiscountEntity> discounts) {
        this.discounts = discounts;
        return this;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public ShopItem getItem() {
        return item;
    }

    public void setItem(ShopItem shopItem) {
        this.item = shopItem;
    }

    @JsonIgnore
    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public Boolean getIsDriver() {
        return isDriver;
    }

    public void setIsDriver(Boolean driver) {
        isDriver = driver;
    }

    public Boolean getNeedsTicket() {
        return needsTicket;
    }

    public void setNeedsTicket(Boolean needsTicket) {
        this.needsTicket = needsTicket;
    }

    public String getDescription() {
        return description;
    }

    public OrderedItem setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getName() {
        return name;
    }

    public OrderedItem setName(String name) {
        this.name = name;
        return this;
    }

    public Timestamp getLastCancelTimestamp() {
        return lastCancelTimestamp;
    }

    public OrderedItem setLastCancelTimestamp(Timestamp lastCancelTimestamp) {
        this.lastCancelTimestamp = lastCancelTimestamp;
        return this;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "OrderedItem{" +
                "id=" + id +
                ", price=" + price +
                ", status=" + status +
                ", size='" + size + '\'' +
                ", isDriver=" + isDriver +
                ", needsTicket=" + needsTicket +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderedItem that = (OrderedItem) o;
        return id == that.id;
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
