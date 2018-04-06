package memo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.*;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private java.sql.Timestamp date;

    @Lob
    private String description;

    @Enumerated(EnumType.ORDINAL)
    private ClubRole expectedReadRole = ClubRole.Mitglied;

    @Enumerated(EnumType.ORDINAL)
    private ClubRole expectedCheckInRole = ClubRole.Mitglied;

    @Enumerated(EnumType.ORDINAL)
    private ClubRole expectedWriteRole = ClubRole.Vorstand;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "item")
    @JsonSerialize(using = ImagePathListSerializer.class)
    @JsonDeserialize(using = ImagePathListDeserializer.class)
    private List<Image> images;

    @OneToOne()
    @JsonSerialize(using = ImagePathSerializer.class)
    @JsonDeserialize(using = ImagePathDeserializer.class)
    private Image groupPicture;

    @Column(nullable = false)
    private Integer capacity = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "item")
    @JsonSerialize(using = AddressIdListSerializer.class)
    @JsonDeserialize(using = AddressIdListDeserializer.class)
    private List<Address> route = new ArrayList<>();

    private String material;

    private String vehicle;

    private Integer miles = 0;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "authoredItems")
    @JsonSerialize(using = UserIdListSerializer.class)
    @JsonDeserialize(using = UserIdListDeserializer.class)
    private List<User> author = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "reportResponsibilities")
    @JsonSerialize(using = UserIdListSerializer.class)
    @JsonDeserialize(using = UserIdListDeserializer.class)
    private List<User> reportWriters = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "item")
    @JsonSerialize(using = CommentIdListSerializer.class)
    @JsonDeserialize(using = CommentIdListDeserializer.class)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.LAZY, mappedBy = "item")
    @JsonIgnore
    private List<Entry> entries = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "item")
    private List<OrderedItem> orders = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "item")
    private List<Stock> stock = new ArrayList<>();

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

    public java.sql.Timestamp getDate() {
        return this.date;
    }

    public void setDate(java.sql.Timestamp date) {
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

    public BigDecimal getPrice() {
        return this.price;
    }

    public void setPrice(BigDecimal price) {
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

    public void addImage(Image i) {
        this.images.add(i);
    }

    public List<Address> getRoute() {
        return route;
    }

    public void setRoute(List<Address> route) {
        this.route = route;
    }

    public void addAddress(Address a) {
        this.route.add(a);
    }

    public List<User> getAuthor() {
        return author;
    }

    public void setAuthor(List<User> author) {
        this.author = author;
    }

    public void addAuthor(User a) {
        this.author.add(a);
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void addComment(Comment c) {
        this.comments.add(c);
    }

    public List<Entry> getEntries() {
        return entries;
    }

    public void setEntries(List<Entry> entries) {
        this.entries = entries;
    }

    public void addEntry(Entry e) {
        this.entries.add(e);
    }

    @JsonIgnore
    public List<OrderedItem> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderedItem> orders) {
        this.orders = orders;
    }

    public void addOrder(OrderedItem o) {
        this.orders.add(o);
    }

    @JsonIgnore
    public List<Stock> getStock() {
        return stock;
    }

    public void setStock(List<Stock> stock) {
        this.stock = stock;
    }

    public void addStock(Stock s) {
        this.stock.add(s);
    }

    public Image getGroupPicture() {
        return groupPicture;
    }

    public ShopItem setGroupPicture(Image groupPicture) {
        this.groupPicture = groupPicture;
        return this;
    }

    public List<User> getReportWriters() {
        return reportWriters;
    }

    public ShopItem setReportWriters(List<User> reportWriters) {
        this.reportWriters = reportWriters;
        return this;
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
                ", capacity=" + capacity +
                ", price=" + price +
                ", material='" + material + '\'' +
                ", vehicle='" + vehicle + '\'' +
                ", miles=" + miles +
                ", type=" + type +
                '}';
    }
}
