package memo.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "COLORS")
public class Color implements Serializable {

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    //**************************************************************
    //  members
    //**************************************************************

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "color")
    private List<OrderedItem> orderedItems = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "color")
    private List<Stock> stock = new ArrayList<>();

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String hex;

    //**************************************************************
    //  constructor
    //**************************************************************

    public Color() {
        super();
    }

    public Color(String name, String hex) {
        this.name = name;
        this.hex = hex;
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public List<OrderedItem> getOrderedItems() {
        return orderedItems;
    }

    public void setOrderedItems(List<OrderedItem> orderedItems) {
        this.orderedItems = orderedItems;
    }

    public void addOrderedItem(OrderedItem o) { this.orderedItems.add(o);}

    public List<Stock> getStock() {
        return stock;
    }

    public void setStock(List<Stock> stock) {
        this.stock = stock;
    }

    public void addStock(Stock s) {this.stock.add(s);}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHex() {
        return hex;
    }

    public void setHex(String hex) {
        this.hex = hex;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Color{" +
                "id=" + id +
                ", orderedItems=" + orderedItems +
                ", name='" + name + '\'' +
                ", hex='" + hex + '\'' +
                '}';
    }
}
