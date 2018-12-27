package memo.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.ShopItemIdDeserializer;
import memo.serialization.ShopItemIdSerializer;
import memo.serialization.UserIdDeserializer;
import memo.serialization.UserIdSerializer;

import javax.persistence.*;

@Entity
@Table(name = "WAITING_LIST")
public class WaitingListEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer amount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    @JsonSerialize(using = ShopItemIdSerializer.class)
    @JsonDeserialize(using = ShopItemIdDeserializer.class)
    private ShopItem shopItem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    @JsonSerialize(using = UserIdSerializer.class)
    @JsonDeserialize(using = UserIdDeserializer.class)
    private User user;

    private String size;

    //todo?
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    private Color color;

    public String getSize() {
        return size;
    }

    public WaitingListEntry setSize(String size) {
        this.size = size;
        return this;
    }

    public Color getColor() {
        return color;
    }

    public WaitingListEntry setColor(Color color) {
        this.color = color;
        return this;
    }

    public Integer getId() {
        return id;
    }

    public WaitingListEntry setId(Integer id) {
        this.id = id;
        return this;
    }

    public Integer getAmount() {
        return amount;
    }

    public ShopItem getShopItem() {
        return shopItem;
    }

    public WaitingListEntry setShopItem(ShopItem shopItem) {
        this.shopItem = shopItem;
        return this;
    }

    public WaitingListEntry setAmount(Integer amount) {
        this.amount = amount;
        return this;
    }

    public User getUser() {
        return user;
    }

    public WaitingListEntry setUser(User user) {
        this.user = user;
        return this;
    }
}
