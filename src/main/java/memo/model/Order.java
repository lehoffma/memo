package memo.model;


import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.BankAccIdDeserializer;
import memo.serialization.BankAccIdSerializer;
import memo.serialization.UserIdDeserializer;
import memo.serialization.UserIdSerializer;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "ORDERS")
@NamedQueries({
        @NamedQuery(
                name = "Order.findByOrderedItem",
                query = "SELECT o FROM Order o " +
                        " WHERE :orderedItemId IN (SELECT item.id FROM o.items item)"
        ),
        @NamedQuery(
                name = "Order.findByUser",
                query = "SELECT o FROM Order o " +
                        " WHERE o.user.id = :userId"
        )
})
public class Order implements Serializable {


    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    //**************************************************************
    //  members
    //**************************************************************

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @JsonSerialize(using = UserIdSerializer.class)
    @JsonDeserialize(using = UserIdDeserializer.class)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonDeserialize(using = BankAccIdDeserializer.class)
    @JsonSerialize(using = BankAccIdSerializer.class)
    private BankAcc bankAccount;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "order")
    private List<OrderedItem> items = new ArrayList<>();

    @Column(nullable = false)
    private java.sql.Timestamp timeStamp;

    private PaymentMethod method = PaymentMethod.Lastschrift;

    private String text;

    public Order() {
    }

    //**************************************************************
    //  constructor
    //**************************************************************

    //**************************************************************
    //  getters and setters
    //**************************************************************

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

    public java.sql.Timestamp getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(java.sql.Timestamp timeStamp) {
        this.timeStamp = timeStamp;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public List<OrderedItem> getItems() {
        return items;
    }

    public void setItems(List<OrderedItem> items) {
        this.items = items;
    }

    public void addItem(OrderedItem o) {
        this.items.add(o);
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public BankAcc getBankAccount() {
        return bankAccount;
    }

    public Order setBankAccount(BankAcc bankAccount) {
        this.bankAccount = bankAccount;
        return this;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", timeStamp=" + timeStamp +
                ", method=" + method +
                ", text='" + text + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return id == order.id;
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
