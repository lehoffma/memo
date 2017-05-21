package memo.model;

import java.io.Serializable;
import java.lang.Boolean;
import java.lang.Integer;
import java.lang.String;
import java.sql.Date;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: User
 *
 */
@Entity
@Table(name = "USERS")


public class User implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false)
	private Integer id;

	@Column(name = "FIRST_NAME", nullable = false)
	private String firstName;

	@Column(name = "LAST_NAME", nullable = false)
	private String lastName;

	@ManyToOne(cascade = { CascadeType.REMOVE })
	@JoinColumn(name = "ROLE_ID")
	private ClubRole role;

	@ManyToOne(cascade = { CascadeType.REMOVE })
	@JoinColumn(name = "ADDRESS_ID")
	private Address address;

	@Column(nullable = false)
	private Date birthday;

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
	private String imagePath;
	
	@OneToOne(cascade = { CascadeType.REFRESH })
	@JoinColumn(name ="BANK_ACCOUNT_ID")
	private BankAcc bankAccount;

	@Column(name = "JOIN_DATE", nullable = false)
	private Date joinDate;

	private char gender;

	private static final long serialVersionUID = 1L;

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

	public String getLastName() {
		return this.lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public ClubRole getRole() {
		return this.role;
	}

	public void setRole(ClubRole role) {
		this.role = role;
	}

	public Address getAddress() {
		return this.address;
	}

	public void setAddress(Address address) {
		this.address = address;
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

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public BankAcc getBankAccount() {
		return bankAccount;
	}

	public void setBankAccount(BankAcc bankAccount) {
		this.bankAccount = bankAccount;
	}
	
	public boolean checkPassword(String password){
		return this.password == password;
	}

}
