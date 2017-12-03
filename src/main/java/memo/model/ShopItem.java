package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Entity implementation class for Entity: ShopItem
 */
@Entity
@Table(name = "SHOP_ITEMS")
public class ShopItem implements Serializable {

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

    @Expose
    @Column(nullable = false)
    private String title;

    @Expose(serialize = true, deserialize = false)
    @Column(nullable = false)
    private LocalDateTime date;

    @Expose
    @Lob
    private String description;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private ClubRole expectedReadRole = ClubRole.Mitglied;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private ClubRole expectedCheckInRole = ClubRole.Mitglied;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private ClubRole expectedWriteRole = ClubRole.Vorstand;

    @Expose
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER,mappedBy = "item")
    private List<Image> images;

    @Expose
    @Column(nullable = false)
    private Integer capacity = 0;

    // ToDo: fix
    @Expose
    @Column(name = "PRICE_MEMBER", nullable = false)
    private float priceMember;

    @Expose
    @Column(nullable = false)
    private float price;

    @Expose
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "item")
    private List<Address> route = new ArrayList<>();

    @Expose
    private String material;

    @Expose
    private String vehicle;

    @Expose
    private Integer miles = 0;

    @Expose(serialize = false, deserialize = true)
    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "authoredItems")
    private Set<User> author = new HashSet<>();

    @Expose
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "item")
    private List<Comment> comments;

    @Expose(serialize = false, deserialize = false)
    @OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.LAZY, mappedBy = "item")
    private List<Entry> entries;

    @Expose(serialize = false, deserialize = false)
    @OneToMany(fetch = FetchType.LAZY,mappedBy = "item")
    private Set<OrderedItem> orders = new HashSet<>();

    @Expose(serialize = false, deserialize = false)
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "item")
    private Set<Stock> stock = new HashSet<>();

    @Expose
    @Column(nullable = false)
    private Integer type;

    //**************************************************************
    //  constructor
    //**************************************************************

    public ShopItem() {
        super();
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

    public String getTitle() {
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getDate() {
        return this.date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ClubRole getExpectedReadRole() {
        return this.expectedReadRole;
    }

    public void setExpectedReadRole(ClubRole expectedReadRole) {
        this.expectedReadRole = expectedReadRole;
    }

    public ClubRole getExpectedWriteRole() {
        return this.expectedWriteRole;
    }

    public void setExpectedWriteRole(ClubRole expectedWriteRole) {
        this.expectedWriteRole = expectedWriteRole;
    }

    public Integer getCapacity() {
        return this.capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public float getPriceMember() {
        return this.priceMember;
    }

    public void setPriceMember(float priceMember) {
        this.priceMember = priceMember;
    }

    public float getPrice() {
        return this.price;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public String getMaterial() {
        return this.material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getVehicle() {
        return this.vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public Integer getMiles() {
        return this.miles;
    }

    public void setMiles(Integer miles) {
        this.miles = miles;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public ClubRole getExpectedCheckInRole() {
        return expectedCheckInRole;
    }

    public void setExpectedCheckInRole(ClubRole expectedCheckinRole) {
        this.expectedCheckInRole = expectedCheckinRole;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    public List<Address> getRoute() {
        return route;
    }

    public void setRoute(List<Address> route) {
        this.route = route;
    }

    public Set<User> getAuthor() {
        return author;
    }

    public void setAuthor(Set<User> author) {
        this.author = author;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public List<Entry> getEntries() {
        return entries;
    }

    public void setEntries(List<Entry> entries) {
        this.entries = entries;
    }

    public Set<OrderedItem> getOrders() {
        return orders;
    }

    public void setOrders(Set<OrderedItem> orders) {
        this.orders = orders;
    }

    public Set<Stock> getStock() {
        return stock;
    }

    public void setStock(Set<Stock> stock) {
        this.stock = stock;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "ShopItem{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", date=" + date +
                ", description='" + description + '\'' +
                ", expectedReadRole=" + expectedReadRole +
                ", expectedCheckInRole=" + expectedCheckInRole +
                ", expectedWriteRole=" + expectedWriteRole +
                ", images=" + images +
                ", capacity=" + capacity +
                ", priceMember=" + priceMember +
                ", price=" + price +
                ", route=" + route +
                ", material='" + material + '\'' +
                ", vehicle='" + vehicle + '\'' +
                ", miles=" + miles +
                ", author=" + author +
                ", comments=" + comments +
                ", entries=" + entries +
                ", orders=" + orders +
                ", stock=" + stock +
                ", type=" + type +
                '}';
    }
}
