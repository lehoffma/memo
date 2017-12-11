package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Entity implementation class for Entity: BankAcc
 */
@Entity
@Table(name = "BANK_ACCOUNTS")

public class BankAcc implements Serializable {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private transient User user;

    @Expose
    @Column
    private String name;

    @Expose
    @Column(nullable = false)
    private String iban;

    @Expose
    @Column(nullable = false)
    private String bic;

    @Expose
    private String bankName;

    //**************************************************************
    //  constructor
    //**************************************************************

    public BankAcc() {
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBankName() {
        return this.bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getIban() {
        return this.iban;
    }

    public void setIban(String iban) {
        this.iban = iban;
    }

    public String getBic() {
        return this.bic;
    }

    public void setBic(String bic) {
        this.bic = bic;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "BankAcc{" +
                "id=" + id +
                ", user=" + user +
                ", name='" + name + '\'' +
                ", iban='" + iban + '\'' +
                ", bic='" + bic + '\'' +
                ", bankName='" + bankName + '\'' +
                '}';
    }
}
