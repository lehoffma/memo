package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: AdDress
 *
 */
@Entity
@Table(name="ADDRESSES")

@NamedQuery(name = "getAddressById", query = "SELECT a FROM Address a WHERE a.id = :id")
public class Address implements Serializable {

	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer id;
	private String name;
	
	@Column(nullable=false)
	private String street;
	
	@Column(nullable=false)
	private String streetNr;
	
	@Column(nullable=false)
	private String zipCode;
	
	@Column(nullable=false)
	private String city;
	private String country = "Germany";

	private double latitude;
	private double longitude;

	private static final long serialVersionUID = 1L;

	public Address() {
		super();
	}   
	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}   
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}   
	public String getStreet() {
		return this.street;
	}

	public void setStreet(String street) {
		this.street = street;
	}   
	public String getStreetNr() {
		return this.streetNr;
	}

	public void setStreetNr(String streetNr) {
		this.streetNr = streetNr;
	}   
	public String getZipCode() {
		return this.zipCode;
	}

	public void setZipCode(String zipCode) {
		this.zipCode = zipCode;
	}   
	public String getCity() {
		return this.city;
	}

	public void setCity(String city) {
		this.city = city;
	}   
	public String getCountry() {
		return this.country;
	}

	public void setCountry(String country) {
		this.country = country;
	}
   
}
