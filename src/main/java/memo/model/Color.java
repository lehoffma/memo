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

}
