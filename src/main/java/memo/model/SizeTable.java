package memo.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * Entity implementation class for Entity: SizeTable
 */
@Entity
@Table(name = "SIZE_TABLE")

public class SizeTable implements Serializable {

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
    private Stock stock;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer min;

    private Integer max;

    //**************************************************************
    //  constructor
    //**************************************************************

    public SizeTable() {
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

    public Stock getStock() {
        return this.stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMin() {
        return min;
    }

    public SizeTable setMin(Integer minValue) {
        this.min = minValue;
        return this;
    }

    public Integer getMax() {
        return max;
    }

    public SizeTable setMax(Integer maxValue) {
        this.max = maxValue;
        return this;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "SizeTable{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", min=" + min +
                ", max=" + max +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SizeTable sizeTable = (SizeTable) o;
        return Objects.equals(id, sizeTable.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
