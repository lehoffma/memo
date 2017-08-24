package memo.model;


import com.google.gson.annotations.Expose;

import javax.persistence.*;

@Entity
@Table(name = "ORDERED_ITEMS")
public class OrderedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "EVENT_ID", referencedColumnName = "ID")
    private Event event;


    @Expose
    @Column(name = "ORDER_ID")
    private Integer orderId;

    // Without Driver reduction
    @Expose
    private int price;

    @Expose
    private OrderStatus status;

    @Expose
    private String size;

    @ManyToOne
    @JoinColumn(name = "COLOR_ID",referencedColumnName = "ID")
    private Color color;

    @Expose
    @Column(name = "IS_DRIVER")
    private Boolean isDriver = false;

    @Expose
    @Column(name = "NEEDS_TICKET")
    private Boolean needsTicket;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
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

    @Override
    public String toString() {
        return "OrderedItem{" +
                "id=" + id +
                ", event=" + event +
                ", order=" + orderId +
                ", price=" + price +
                ", status=" + status +
                ", size='" + size + '\'' +
                ", color=" + color +
                ", isDriver=" + isDriver +
                ", needsTicket=" + needsTicket +
                '}';
    }
}
