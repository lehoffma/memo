package memo.model;

import javax.persistence.*;
import java.io.Serializable;


@Entity
@Table(name = "COLORS")
public class Color implements Serializable{

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false)
    private String HexCode;


    private static final long serialVersionUID = 1L;

    public Color(){super();}

    public Color(String name,String hex){
        this.name = name;
        this.HexCode = hex;
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

    public String getHexCode() {
        return HexCode;
    }

    public void setHexCode(String hexCode) {
        HexCode = hexCode;
    }

    @Override
    public String toString() {
        return "Color{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", HexCode='" + HexCode + '\'' +
                '}';
    }
}
