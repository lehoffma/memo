package memo.model;

import com.google.gson.annotations.Expose;

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
    @Expose
	private String name;
    @Expose
	@Column(nullable=false)
	private String street;
    @Expose
	private String streetNr;
    @Expose
	@Column(nullable=false)
	private String zip;
    @Expose
	@Column(nullable=false)
	private String city;
    @Expose
	private String country = "Germany";
    @Expose
	private double latitude;
    @Expose
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
	public String getZip() {
		return this.zip;
	}

	public void setZip(String zip) {
		this.zip = zip;
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

    @Override
    public String toString() {
        return "Address{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", street='" + street + '\'' +
                ", streetNr='" + streetNr + '\'' +
                ", zip='" + zip + '\'' +
                ", city='" + city + '\'' +
                ", country='" + country + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                '}';
    }
}
