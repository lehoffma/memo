package memo.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.ShopItemIdDeserializer;
import memo.serialization.ShopItemIdSerializer;
import memo.serialization.UserIdDeserializer;
import memo.serialization.UserIdSerializer;

import javax.persistence.*;

@Entity
@Table(name = "waiting_list")
public class WaitingListEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    private Color color;

    private Boolean isDriver;

    private Boolean needsTicket;

    public Boolean getIsDriver() {
        return isDriver;
    }

    public WaitingListEntry setIsDriver(Boolean driver) {
        isDriver = driver;
        return this;
    }

    public Boolean getNeedsTicket() {
        return needsTicket;
    }

    public WaitingListEntry setNeedsTicket(Boolean needsTicket) {
        this.needsTicket = needsTicket;
        return this;
    }

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

    public ShopItem getShopItem() {
        return shopItem;
    }

    public WaitingListEntry setShopItem(ShopItem shopItem) {
        this.shopItem = shopItem;
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
