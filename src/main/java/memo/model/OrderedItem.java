package memo.model;


import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "ORDERED_ITEMS")
public class OrderedItem implements Serializable{

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    //**************************************************************
    //  members
    //**************************************************************

    @Expose(serialize = true, deserialize = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Expose
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private ShopItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private transient Order order;

    // Without Driver reduction
    @Expose
    private int price = 0;

    @Expose
    private OrderStatus status = OrderStatus.Reserved;

    @Expose
    private String size;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    private Color color;

    @Expose
    @Column(name = "IS_DRIVER")
    private Boolean isDriver = false;

    @Expose
    @Column(name = "NEEDS_TICKET")
    private Boolean needsTicket = true;

    //**************************************************************
    //  constructor
    //**************************************************************

    public OrderedItem() {super();}

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

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
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

    public Boolean getDriver() {
        return isDriver;
    }

    public void setDriver(Boolean driver) {
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
                ", item=" + item +
                ", order=" + order +
                ", price=" + price +
                ", status=" + status +
                ", size='" + size + '\'' +
                ", color=" + color +
                ", isDriver=" + isDriver +
                ", needsTicket=" + needsTicket +
                '}';
    }
}
