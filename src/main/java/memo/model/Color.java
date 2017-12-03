package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;


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

    @Expose(serialize = true, deserialize = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Expose(serialize = false, deserialize = false)
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "color")
    private Set<OrderedItem> orderedItems = new HashSet<>();

    @Expose(serialize = false, deserialize = false)
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "color")
    private Set<Stock> stock = new HashSet<>();

    @Expose
    @Column(nullable = false)
    private String name;

    @Expose
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

    public Set<OrderedItem> getOrderedItems() {
        return orderedItems;
    }

    public void setOrderedItems(Set<OrderedItem> orderedItems) {
        this.orderedItems = orderedItems;
    }

    public Set<Stock> getStock() {
        return stock;
    }

    public void setStock(Set<Stock> stock) {
        this.stock = stock;
    }

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
        hex = hex;
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
