package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Entity implementation class for Entity: PermissionState
 */
@Entity
@Table(name = "PERMISSION_STATES")

public class PermissionState implements Serializable {

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

    @Expose(serialize = false, deserialize = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "permissions")
    private User user;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission funds = Permission.none;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission party = Permission.none;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission userManagement = Permission.none;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission merch = Permission.none;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission tour = Permission.none;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission stock = Permission.none;

    @Expose
    @Enumerated(EnumType.ORDINAL)
    private Permission settings = Permission.none;


    //**************************************************************
    //  constructor
    //**************************************************************

    public PermissionState(ClubRole role) {
        switch (role) {
            case none:

                this.funds = Permission.none;
                this.party = Permission.read;
                this.userManagement = Permission.none;
                this.merch = Permission.none;
                this.tour = Permission.read;
                this.stock = Permission.none;
                this.settings = Permission.none;

                break;

            case Mitglied:

                this.funds = Permission.none;
                this.party = Permission.read;
                this.userManagement = Permission.none;
                this.merch = Permission.read;
                this.tour = Permission.read;
                this.stock = Permission.none;
                this.settings = Permission.none;

                break;

            case Vorstand:

                this.funds = Permission.read;
                this.party = Permission.write;
                this.userManagement = Permission.create;
                this.merch = Permission.write;
                this.tour = Permission.read;
                this.stock = Permission.create;
                this.settings = Permission.read;

                break;

            case Schriftführer:

                this.funds = Permission.read;
                this.party = Permission.write;
                this.userManagement = Permission.create;
                this.merch = Permission.write;
                this.tour = Permission.read;
                this.stock = Permission.create;
                this.settings = Permission.read;

                break;

            case Kassenwart:

                this.funds = Permission.delete;
                this.party = Permission.write;
                this.userManagement = Permission.create;
                this.merch = Permission.write;
                this.tour = Permission.read;
                this.stock = Permission.create;
                this.settings = Permission.read;

                break;

            case Organisator:

                this.funds = Permission.create;
                this.party = Permission.delete;
                this.userManagement = Permission.create;
                this.merch = Permission.delete;
                this.tour = Permission.delete;
                this.stock = Permission.delete;
                this.settings = Permission.read;

                break;

            case Admin:

                this.funds = Permission.admin;
                this.party = Permission.admin;
                this.userManagement = Permission.admin;
                this.merch = Permission.admin;
                this.tour = Permission.admin;
                this.stock = Permission.admin;
                this.settings = Permission.admin;

                break;
        }
    }

    public PermissionState() {
        this(ClubRole.none);
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Permission getFunds() {
        return funds;
    }

    public void setFunds(Permission funds) {
        this.funds = funds;
    }

    public Permission getParty() {
        return party;
    }

    public void setParty(Permission party) {
        this.party = party;
    }

    public Permission getUserManagement() {
        return userManagement;
    }

    public void setUserManagement(Permission userManagement) {
        this.userManagement = userManagement;
    }

    public Permission getMerch() {
        return merch;
    }

    public void setMerch(Permission merch) {
        this.merch = merch;
    }

    public Permission getTour() {
        return tour;
    }

    public void setTour(Permission tour) {
        this.tour = tour;
    }

    public Permission getStock() {
        return stock;
    }

    public void setStock(Permission stock) {
        this.stock = stock;
    }

    public Permission getAccount() {
        return settings;
    }

    public void setAccount(Permission account) {
        this.settings = account;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "PermissionState{" +
                "id=" + id +
                ", funds=" + funds +
                ", party=" + party +
                ", userManagement=" + userManagement +
                ", merch=" + merch +
                ", tour=" + tour +
                ", stock=" + stock +
                ", settings=" + settings +
                '}';
    }
}
