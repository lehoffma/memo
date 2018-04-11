package memo.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn()
    private User user;

    @Column
    private String name;

    @Column(nullable = false)
    private String iban;

    @Column(nullable = false)
    private String bic;

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
                ", name='" + name + '\'' +
                ", iban='" + iban + '\'' +
                ", bic='" + bic + '\'' +
                ", bankName='" + bankName + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BankAcc bankAcc = (BankAcc) o;
        return Objects.equals(id, bankAcc.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
