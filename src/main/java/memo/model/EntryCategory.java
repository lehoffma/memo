package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity implementation class for Entity: EntryCategory
 */
@Entity
@Table(name = "ENTRY_CATEGORIES")

public class EntryCategory implements Serializable {


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
    @OneToMany(cascade = CascadeType.REFRESH, fetch = FetchType.LAZY, mappedBy = "category")
    private Set<Entry> entry = new HashSet<>();

    @Expose
    @Column(nullable = false)
    private String name;

    @Expose
    @Column(nullable = false)
    private Integer category;

    //**************************************************************
    //  constructor
    //**************************************************************

    public EntryCategory() {
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

    public Set<Entry> getEntry() {
        return entry;
    }

    public void setEntry(Set<Entry> entry) {
        this.entry = entry;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCategory() {
        return this.category;
    }

    public void setCategory(Integer category) {
        this.category = category;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "EntryCategory{" +
                "id=" + id +
                ", entry=" + entry +
                ", name='" + name + '\'' +
                ", category=" + category +
                '}';
    }
}
