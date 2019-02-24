package memo.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.ShopItemIdDeserializer;
import memo.serialization.StockAmountDeserializer;
import memo.serialization.StockAmountSerializer;

import javax.persistence.*;
import java.io.Serializable;
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
                name = "Stock.boughtAmount",
                query = " SELECT count(distinct orderedItem) " +
                        "  FROM Stock stock, OrderedItem orderedItem \n" +
                        "   WHERE stock.item.id = orderedItem.item.id \n" +
                        "   AND stock.color.name = orderedItem.color.name\n" +
                        "   AND stock.size = orderedItem.size \n" +
                        "   AND stock.id = :id"
        ),
        @NamedQuery(
                name = "Stock.findByShopItem",
                query = "SELECT s \n" +
                        " FROM Stock s " +
                        "       WHERE s.item.id = :id "
        ),
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

    @JsonDeserialize(using = StockAmountDeserializer.class)
    @JsonSerialize(using = StockAmountSerializer.class)
    private Integer amount = 0;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE}, fetch = FetchType.EAGER)
    @JoinColumn
    private Color color;

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
