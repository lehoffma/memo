package memo.model;

import javax.persistence.*;
import java.io.Serializable;

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

    public SizeTable(Stock stock, String name, Integer min, Integer max) {
        this.stock = stock;
        this.name = name;
        this.min = min;
        this.max = max;
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
        return this.min;
    }

    public void setMin(Integer min) {
        this.min = min;
    }

    public Integer getMax() {
        return this.max;
    }

    public void setMax(Integer max) {
        this.max = max;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "SizeTable{" +
                "id=" + id +
                ", stock=" + stock +
                ", name='" + name + '\'' +
                ", min=" + min +
                ", max=" + max +
                '}';
    }
}
