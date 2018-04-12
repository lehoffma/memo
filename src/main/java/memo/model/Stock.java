package memo.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import memo.serialization.ShopItemIdDeserializer;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Entity implementation class for Entity: Stock
 */
@Entity
@Table(name = "STOCK")
@NamedQueries({
        @NamedQuery(
                name = "Stock.findByShopItemType",
                query = "SELECT s FROM Stock s " +
                        " WHERE s.item.type = :typ"
        ),
        @NamedQuery(
                name = "Stock.findByShopItem",
                query = "SELECT s FROM Stock s " +
                        " WHERE s.item.id = :id"
        )
})
public class Stock implements Serializable {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    @JsonDeserialize(using = ShopItemIdDeserializer.class)
    private ShopItem item;

    private String size = "oneSize";

    private Integer amount = 0;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn
    private Color color;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn
    private List<SizeTable> sizeTable = new ArrayList<>();

    //**************************************************************
    //  constructor
    //**************************************************************

    public Stock() {
        super();
    }

    public Stock(ShopItem shopItem, String size, Integer amount, Color color) {
        this.item = shopItem;
        this.size = size;
        this.amount = amount;
        this.color = color;
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ShopItem getItem() {
        return this.item;
    }

    public void setItem(ShopItem item) {
        this.item = item;
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

    public List<SizeTable> getSizeTable() {
        return sizeTable;
    }

    public void setSizeTable(List<SizeTable> sizeTable) {
        this.sizeTable = sizeTable;
    }

    public void addSizeTable(SizeTable s) {
        this.sizeTable.add(s);
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Stock{" +
                "id=" + id +
                ", name='" + size + '\'' +
                ", amount=" + amount +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Stock stock = (Stock) o;
        return Objects.equals(id, stock.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
