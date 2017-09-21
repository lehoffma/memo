package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Entity implementation class for Entity: Size
 */
@Entity
@Table(name = "SIZES")

public class Size implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Expose
    private Integer id;

    @ManyToOne(cascade = {CascadeType.PERSIST})
    @JoinColumn(name = "EVENT_ID")
    @Expose
    private Event event;

    @Expose
    private String size;

    @Column(name = "STOCK")
    @Expose
    private Integer amount;

    @ManyToOne(cascade = {CascadeType.REMOVE})
    @JoinColumn(name = "COLOR_ID")
    @Expose
    private Color color;

    public Size() {
        super();
    }

    public Size(Event event, String size, Integer amount, Color color) {
        this.event = event;
        this.size = size;
        this.amount = amount;
        this.color = color;
    }

    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Event getEvent() {
        return this.event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getSize() {
        return this.size;
    }

    public void setSize(String name) {
        this.size = name;
    }

    public Integer getAmount() {
        return this.amount;
    }

    public void setAmount(Integer NumInStock) {
        this.amount = NumInStock;
    }

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    @Override
    public String toString() {
        return "Size{" +
                "id=" + id +
                ", event=" + event +
                ", name='" + size + '\'' +
                ", amount=" + amount +
                ", color=" + color +
                '}';
    }
}
