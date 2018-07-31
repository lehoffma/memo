package memo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.*;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Entity implementation class for Entity: Entry
 */
@Entity
@Table(name = "ENTRIES")
@NamedQueries({
        @NamedQuery(
                name = "Entry.findByEventId",
                query = "SELECT e FROM Entry e WHERE e.item.id = :Id"
        ),
        @NamedQuery(
                name = "Entry.findByType",
                query = "SELECT e FROM Entry e WHERE e.item.type = :type"
        )
})
public class Entry implements Serializable {


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
    @JoinColumn(nullable = false)
    @JsonDeserialize(using = ShopItemIdDeserializer.class)
    @JsonSerialize(using = ShopItemIdSerializer.class)
    private ShopItem item;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    @JsonDeserialize(using = EntryCategoryIdDeserializer.class)
    @JsonSerialize(using = EntryCategoryIdSerializer.class)
    private EntryCategory category;

    @Column(nullable = false)
    private String name;

    //todo remove from db later
    @Column(precision = 12, scale = 2)
    @JsonProperty("deprecatedValue")
    private BigDecimal value = new BigDecimal(0);

    @Column(nullable = false, precision = 12, scale = 2)
    @JsonProperty("value")
    private BigDecimal actualValue = new BigDecimal(0);

    @Column(name = "IS_INCOME")
    private Boolean isIncome = false;

    private String comment;

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.LAZY, mappedBy = "entry")
    @JsonSerialize(using = ImagePathListSerializer.class)
    @JsonDeserialize(using = ImagePathListDeserializer.class)
    private List<Image> images = new ArrayList<>();

    @Column(nullable = false)
    private java.sql.Timestamp date;

    //**************************************************************
    //  constructor
    //**************************************************************

    public Entry() {
        super();
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public ShopItem getItem() {
        return this.item;
    }

    public void setItem(ShopItem item) {
        this.item = item;
    }

    public EntryCategory getCategory() {
        return this.category;
    }

    public void setCategory(EntryCategory category) {
        this.category = category;
    }

    @JsonIgnore
    public BigDecimal getValue() {
        return this.value;
    }

    public void setValue(BigDecimal amount) {
        this.value = amount;
    }

    public BigDecimal getActualValue() {
        return actualValue;
    }

    public Entry setActualValue(BigDecimal actualValue) {
        this.actualValue = actualValue;
        return this;
    }

    public Boolean getIsIncome() {
        return this.actualValue.signum() >= 0;
    }

    public void setIsIncome(Boolean isIncome) {
        this.isIncome = isIncome;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public java.sql.Timestamp getDate() {
        return date;
    }

    public void setDate(java.sql.Timestamp date) {
        this.date = date;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Entry{" +
                "id=" + id +
                ", item=" + item +
                ", category=" + category +
                ", name='" + name + '\'' +
                ", value=" + value +
                ", isIncome=" + isIncome +
                ", comment='" + comment + '\'' +
                ", date=" + date +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Entry entry = (Entry) o;
        return Objects.equals(id, entry.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
