package memo.model;


import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Entity implementation class for Entity: Images
 */


@Entity
@Table(name = "IMAGES")
public class Image implements Serializable{

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;


    // ToDo: anpassen
    private static final String filePath = "";

    //**************************************************************
    //  members
    //**************************************************************

    @Expose(serialize = true, deserialize = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Expose
    @ManyToOne
    @JoinColumn
    private User user;

    @Expose
    @ManyToOne
    @JoinColumn
    private ShopItem item;

    //ToDo: default vergeben

    @Expose
    private String name = "";

    //**************************************************************
    //  constructor
    //**************************************************************

    public Image(){super();}

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ShopItem getItem() {
        return item;
    }

    public void setItem(ShopItem item) {
        this.item = item;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Image{" +
                "id=" + id +
                ", user=" + user +
                ", item=" + item +
                ", name='" + name + '\'' +
                '}';
    }

    protected void finalize() throws Throwable {
        // ToDo: implement
    }
}
