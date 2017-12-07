package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Entity implementation class for Entity: Entry
 */
@Entity
@Table(name = "ENTRIES")

public class Entry implements Serializable {



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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private ShopItem item;

    @Expose
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private EntryCategory category;

    @Expose
    @Column(nullable = false)
    private String name;

    @Expose
    @Column(nullable = false)
    private Integer value;

    @Expose
    @Column(name = "IS_INCOME")
    private Boolean isIncome = false;

    @Expose
    private String comment;

    @Expose
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn
    private List<Image> images = new ArrayList<>();

    @Expose(serialize = true, deserialize = false)
    @Column(nullable = false)
    private LocalDateTime date;

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

    public Integer getValue() {
        return this.value;
    }

    public void setValue(Integer amount) {
        this.value = amount;
    }

    public Boolean getIsIncome() {
        return this.isIncome;
    }

    public void setIsIncome(Boolean isIncome) {
        this.isIncome = isIncome;
    }

    public Boolean getIncome() {
        return isIncome;
    }

    public void setIncome(Boolean income) {
        isIncome = income;
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

    public void addImage(Image i) {this.images.add(i);}

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

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
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
                ", images=" + images +
                ", date=" + date +
                '}';
    }
}
