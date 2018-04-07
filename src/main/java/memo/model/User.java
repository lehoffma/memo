package memo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.*;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity implementation class for Entity: User
 */
@Entity
@Table(name = "USERS")


public class User implements Serializable {

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    //**************************************************************
    //  member
    //**************************************************************

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer id;

    @Column(name = "FIRST_NAME", nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String surname;

    @Enumerated(EnumType.ORDINAL)
    private ClubRole clubRole = ClubRole.Gast;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user")
    @JsonSerialize(using = AddressIdListSerializer.class)
    @JsonDeserialize(using = AddressIdListDeserializer.class)
    private List<Address> addresses = new ArrayList<>();

    @Column(nullable = false)
    private java.sql.Date birthday = new java.sql.Date(new java.util.Date().getTime());

    private String telephone;

    private String mobile;

    @Column(nullable = false)
    private Integer miles = 0;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private Boolean isStudent = false;

    private Boolean hasDebitAuth = false;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "user")
    @JsonSerialize(using = ImagePathListSerializer.class)
    @JsonDeserialize(using = ImagePathListDeserializer.class)
    private List<Image> images = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user")
    @JsonSerialize(using = BankAccIdListSerializer.class)
    @JsonDeserialize(using = BankAccIdListDeserializer.class)
    private List<BankAcc> bankAccounts = new ArrayList<>();

    @Column(name = "JOIN_DATE", nullable = false)
    private java.sql.Date joinDate = new java.sql.Date(new java.util.Date().getTime());

    private String gender;

    @Column(name = "HAS_SEASON_TICKET")
    private Boolean hasSeasonTicket = false;

    @Column(name = "IS_WOELFE_CLUB_MEMBER")
    private Boolean isWoelfeClubMember = false;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn
    private PermissionState permissions;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
    private List<Order> orders = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "author")
    private List<Comment> comments = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinColumn
    private List<ShopItem> authoredItems = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinColumn
    private List<ShopItem> reportResponsibilities = new ArrayList<>();

    //**************************************************************
    //  constructor
    //**************************************************************

    public User() {
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

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public java.sql.Date getBirthday() {
        return this.birthday;
    }

    public void setBirthday(java.sql.Date birthday) {
        this.birthday = birthday;
    }

    public String getTelephone() {
        return this.telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public Integer getMiles() {
        return this.miles;
    }

    public void setMiles(Integer miles) {
        this.miles = miles;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getIsStudent() {
        return this.isStudent;
    }

    public void setIsStudent(Boolean isStudent) {
        this.isStudent = isStudent;
    }

    public Boolean getHasDebitAuth() {
        return this.hasDebitAuth;
    }

    public void setHasDebitAuth(Boolean hasDebitAuth) {
        this.hasDebitAuth = hasDebitAuth;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public Boolean getStudent() {
        return isStudent;
    }

    public void setStudent(Boolean student) {
        isStudent = student;
    }

    public java.sql.Date getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(java.sql.Date joinDate) {
        this.joinDate = joinDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getHasSeasonTicket() {
        return hasSeasonTicket;
    }

    public void setHasSeasonTicket(Boolean hasSeasonTicket) {
        this.hasSeasonTicket = hasSeasonTicket;
    }

//    public Boolean getWoelfeClubMember() {
//        return isWoelfeClubMember;
//    }
//
//    public void setWoelfeClubMember(Boolean woelfeClubMember) {
//        isWoelfeClubMember = woelfeClubMember;
//    }


    public Boolean getIsWoelfeClubMember() {
        return isWoelfeClubMember;
    }

    public User setIsWoelfeClubMember(Boolean isWoelfeClubMember) {
        this.isWoelfeClubMember = isWoelfeClubMember;
        return this;
    }

    public PermissionState getPermissions() {
        return permissions;
    }

    public void setPermissions(PermissionState permissions) {
        this.permissions = permissions;
    }

    public ClubRole getClubRole() {
        return clubRole;
    }

    public void setClubRole(ClubRole clubRole) {
        this.clubRole = clubRole;
    }

    public List<Address> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }

    public void addAddress(Address a) {
        this.addresses.add(a);
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    public void addImage(Image i) {
        this.images.add(i);
    }

    public List<BankAcc> getBankAccounts() {
        return bankAccounts;
    }

    public void setBankAccounts(List<BankAcc> bankAccounts) {
        this.bankAccounts = bankAccounts;
    }

    public void addBankAccount(BankAcc b) {
        this.bankAccounts.add(b);
    }

    @JsonIgnore
    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public void addOrder(Order o) {
        this.orders.add(o);
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void addComment(Comment c) {
        this.comments.add(c);
    }

    @JsonIgnore
    public List<ShopItem> getAuthoredItems() {
        return authoredItems;
    }

    public void setAuthoredItems(List<ShopItem> authoredItems) {
        this.authoredItems = authoredItems;
    }

    public void addAuthoredItem(ShopItem i) {
        this.authoredItems.add(i);
    }

    public List<ShopItem> getReportResponsibilities() {
        return reportResponsibilities;
    }

    public User setReportResponsibilities(List<ShopItem> reportResponsibilities) {
        this.reportResponsibilities = reportResponsibilities;
        return this;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", surname='" + surname + '\'' +
                ", clubRole=" + clubRole +
                ", birthday=" + birthday +
                ", telephone='" + telephone + '\'' +
                ", mobile='" + mobile + '\'' +
                ", miles=" + miles +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", isStudent=" + isStudent +
                ", hasDebitAuth=" + hasDebitAuth +
                ", joinDate=" + joinDate +
                ", gender='" + gender + '\'' +
                ", hasSeasonTicket=" + hasSeasonTicket +
                ", isWoelfeClubMember=" + isWoelfeClubMember +
                '}';
    }
}
