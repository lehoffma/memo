package memo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import memo.serialization.ShopItemIdDeserializer;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "ORDERED_ITEMS")
@NamedQueries({
        @NamedQuery(
                name = "OrderedItem.findByUser",
                query = "SELECT item from Order o join OrderedItem item \n" +
                        "    WHERE o.user.id =:userId"
        ),
        @NamedQuery(
                name = "OrderedItem.findByEvent",
                query = "SELECT DISTINCT o FROM OrderedItem o " +
                        " WHERE o.item.id = :id"
        )
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
    @JoinColumn(nullable = false)
    private Order order;

    // Without Driver reduction
    private BigDecimal price = BigDecimal.valueOf(0);

    private OrderStatus status = OrderStatus.Reserved;

    private String size;

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
