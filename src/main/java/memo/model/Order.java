package memo.model;


import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.sql.Timestamp;


@Entity
@Table(name = "ORDERS")
public class Order {


    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int id;   //globale unique ID

    @ManyToOne(cascade = { CascadeType.PERSIST })
    @JoinColumn(name = "USER_ID", referencedColumnName = "ID")
    private User user;

    @Column(nullable=false)
    private Timestamp timeStamp;

    @Expose
    private PaymentMethod method;

    @Expose
    private String text;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Timestamp getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(Timestamp timeStamp) {
        this.timeStamp = timeStamp;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", user=" + user +
                ", timeStamp=" + timeStamp +
                ", method=" + method +
                ", text='" + text + '\'' +
                '}';
    }
}
