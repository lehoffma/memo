package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Entity implementation class for Entity: SizeTable
 */
@Entity
@Table(name = "SIZE_TABLE")

public class SizeTable implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(cascade = {CascadeType.REMOVE})
    @JoinColumn(name = "SIZE_ID")
    @Expose
    private Size size;

    @Expose
    private String name;

    @Expose
    private Integer min;

    @Expose
    private Integer max;

    public SizeTable() {
        super();
    }

    public SizeTable(Size size, String name, Integer min, Integer max) {
        this.size = size;
        this.name = name;
        this.min = min;
        this.max = max;
    }

    public Integer getId() {
        return this.id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Size getSize() {
        return this.size;
    }

    public void setSize(Size size) {
        this.size = size;
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

    @Override
    public String toString() {
        return "SizeTable{" +
                "id=" + id +
                ", size=" + size +
                ", name='" + name + '\'' +
                ", min=" + min +
                ", max=" + max +
                '}';
    }
}
