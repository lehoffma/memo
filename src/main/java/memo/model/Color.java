package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;


@Entity
@Table(name = "COLORS")
public class Color implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Expose
    private Integer id;

    @Column(nullable = false)
    @Expose
    private String name;

    @Column(nullable = false)
    @Expose
    private String hex;

    public Color() {
        super();
    }

    public Color(String name, String hex) {
        this.name = name;
        this.hex = hex;
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

    public String getHex() {
        return hex;
    }

    public void setHex(String hex) {
        hex = hex;
    }

    @Override
    public String toString() {
        return "Color{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", HexCode='" + hex + '\'' +
                '}';
    }
}
