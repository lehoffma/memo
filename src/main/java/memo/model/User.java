package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Expose(serialize = true, deserialize = false)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer id;

    @Expose
    @Column(name = "FIRST_NAME", nullable = false)
    private String firstName;

    @Expose
    @Column(nullable = false)
    private String surname;

    @Enumerated(EnumType.ORDINAL)
    private ClubRole clubRole = ClubRole.none;

    @Expose
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user")
    private List<Address> addresses = new ArrayList<>();

    @Expose(serialize = true, deserialize = false)
    @Column(nullable = false)
    private LocalDateTime birthday = LocalDateTime.now();

    @Expose
    private String telephone;

    @Expose
    private String mobile;

    @Expose
    @Column(nullable = false)
    private Integer miles = 0;

    @Expose
    @Column(nullable = false)
    private String email;

    @Expose(serialize = false,deserialize = true)
    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Expose
    private Boolean isStudent = false;

    @Expose
    private Boolean hasDebitAuth = false;

    @Expose
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, mappedBy = "user")
    private List<Image> images = new ArrayList<>();

    @Expose(serialize = false, deserialize = true)
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user")
    private List<BankAcc> bankAccounts = new ArrayList<>();

    @Expose(serialize = true, deserialize = false)
    @Column(name = "JOIN_DATE", nullable = false)
    private LocalDateTime joinDate = LocalDateTime.now();

    @Expose
    private String gender;

    @Expose
    @Column(name = "HAS_SEASON_TICKET")
    private Boolean hasSeasonTicket = false;

    @Expose
    @Column(name = "IS_WOELFE_CLUB_MEMBER")
    private Boolean isWoelfeClubMember = false;

    @Expose
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn
    private PermissionState permissions;

    @Expose
    @OneToMany(fetch = FetchType.LAZY,mappedBy = "user")
    private List<Order> orders = new ArrayList<>();

    @Expose
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "author")
    private List<Comment> comments = new ArrayList<>();

    @Expose
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinColumn
    private List<ShopItem> authoredItems = new ArrayList<>();

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

    public LocalDateTime getBirthday() {
        return this.birthday;
    }

    public void setBirthday(LocalDateTime birthday) {
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

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
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

    public Boolean getWoelfeClubMember() {
        return isWoelfeClubMember;
    }

    public void setWoelfeClubMember(Boolean woelfeClubMember) {
        isWoelfeClubMember = woelfeClubMember;
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

    public void addAddress(Address a) {this.addresses.add(a);}

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    public void addImage(Image i) {this.images.add(i);}

    public List<BankAcc> getBankAccounts() {
        return bankAccounts;
    }

    public void setBankAccounts(List<BankAcc> bankAccounts) {
        this.bankAccounts = bankAccounts;
    }

    public void addBankAccount(BankAcc b) {this.bankAccounts.add(b);}

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public void addOrder(Order o) { this.orders.add(o);}

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public void addComment(Comment c) { this.comments.add(c);}

    public List<ShopItem> getAuthoredItems() {
        return authoredItems;
    }

    public void setAuthoredItems(List<ShopItem> authoredItems) {
        this.authoredItems = authoredItems;
    }

    public void addAuthoredItem(ShopItem i) { this.authoredItems.add(i);}

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
                ", addresses=" + addresses +
                ", birthday=" + birthday +
                ", telephone='" + telephone + '\'' +
                ", mobile='" + mobile + '\'' +
                ", miles=" + miles +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", isStudent=" + isStudent +
                ", hasDebitAuth=" + hasDebitAuth +
                ", images=" + images +
                ", bankAccounts=" + bankAccounts +
                ", joinDate=" + joinDate +
                ", gender='" + gender + '\'' +
                ", hasSeasonTicket=" + hasSeasonTicket +
                ", isWoelfeClubMember=" + isWoelfeClubMember +
                ", permissions=" + permissions +
                ", orders=" + orders +
                ", comments=" + comments +
                ", authoredItems=" + authoredItems +
                '}';
    }
}
