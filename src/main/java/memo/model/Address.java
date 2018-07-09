package memo.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.ShopItemIdDeserializer;
import memo.serialization.ShopItemIdSerializer;
import memo.serialization.UserIdDeserializer;
import memo.serialization.UserIdSerializer;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * Entity implementation class for Entity: AdDress
 */
@Entity
@Table(name = "ADDRESSES")

public class Address implements Serializable {

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
    @JsonDeserialize(using = UserIdDeserializer.class)
    @JsonSerialize(using = UserIdSerializer.class)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn()
    @JsonDeserialize(using = ShopItemIdDeserializer.class)
    @JsonSerialize(using = ShopItemIdSerializer.class)
    private ShopItem item;

    private String name;

    @Column(nullable = false)
    private String street;

    private String streetNr;

    @Column(nullable = false)
    private String zip;

    @Column(nullable = false)
    private String city;

    private String country = "Germany";

    private double latitude;

    private double longitude;

    //**************************************************************
    //  constructor
    //**************************************************************

    public Address() {
        super();
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************



    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ShopItem getItem() {
        return item;
    }

    public void setItem(ShopItem item) {
        this.item = item;
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

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    //**************************************************************
    //  methods
    //**************************************************************

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return Objects.equals(id, address.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}
