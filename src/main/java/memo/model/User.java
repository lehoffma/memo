package memo.model;

import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

/**
 * Entity implementation class for Entity: User
 */
@Entity
@Table(name = "USERS")


public class User implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer id;
    @Column(name = "FIRST_NAME", nullable = false)
    @Expose
    private String firstName;
    @Column(nullable = false)
    @Expose
    private String surname;
    @Enumerated(EnumType.ORDINAL)
    private ClubRole clubRole = ClubRole.none;
    @ElementCollection
    @CollectionTable(name = "USER_ADDRESSES")
    @Expose
    private List<Integer> addresses = new ArrayList<Integer>();
    @Column(nullable = false)
    private Date birthday = new Date(0);
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
    @Expose
    @Column(name = "PASSWORD", nullable = false)
    private String passwordHash;
    @Expose
    private Boolean isStudent = false;
    @Expose
    private Boolean hasDebitAuth = false;
    @Expose
    @Column(name = "IMAGE_PATH")
    private String imagePath;
    @ElementCollection
    @CollectionTable(name = "USER_BANK_ACCOUNTS")
    @Expose
    private List<Integer> bankAccounts = new ArrayList<>();
    @Column(name = "JOIN_DATE", nullable = false)
    private Date joinDate = new Date(Calendar.getInstance().getTime().getTime());
    @Expose
    private String gender;
    @Expose
    @Column(name = "HAS_SEASON_TICKET")
    private Boolean hasSeasonTicket = false;
    @Expose
    @Column(name = "IS_WOELFE_CLUB_MEMBER")
    private Boolean isWoelfeClubMember = false;
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PERMISSIONS_ID")
    private PermissionState permissions;

    public User() {
        super();
    }

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

    public Date getBirthday() {
        return this.birthday;
    }

    public void setBirthday(Date birthday) {
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

    public String getImagePath() {
        return this.imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
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

    public Date getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(Date joinDate) {
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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

    public List<Integer> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<Integer> addresses) {
        this.addresses = addresses;
    }

    public List<Integer> getBankAccounts() {
        return bankAccounts;
    }

    public void setBankAccounts(List<Integer> bankAccounts) {
        this.bankAccounts = bankAccounts;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", surname='" + surname + '\'' +
                ", clubRole=" + clubRole +
                ", Adresses=" + addresses.toString() +
                ", birthday=" + birthday +
                ", telephone='" + telephone + '\'' +
                ", mobile='" + mobile + '\'' +
                ", miles=" + miles +
                ", email='" + email + '\'' +
                ", passwordHash='" + passwordHash + '\'' +
                ", isStudent=" + isStudent +
                ", hasDebitAuth=" + hasDebitAuth +
                ", imagePath='" + imagePath + '\'' +
                ", BankAccounts=" + bankAccounts.toString() +
                ", joinDate=" + joinDate +
                ", gender='" + gender + '\'' +
                ", hasSeasonTicket=" + hasSeasonTicket +
                ", isWoelfeClubMember=" + isWoelfeClubMember +
                ", permissions=" + permissions +
                '}';
    }
}
