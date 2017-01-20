package lib.model;

/**
 * Created by gzae on 12/13/16.
 */
public class Address {

    public int adressID;
    public String name;
    public String street;
    public String streetnr;
    public String zip;
    public String city;
    public String country;

    public Address(int ID, String _name, String _street, String _streetnr, String _zip, String _city, String _country)
    {
        this.adressID = ID;
        this.name = _name;
        this.street = _street;
        this.streetnr = _streetnr;
        this.zip = _zip;
        this.city = _city;
        this.country = _country;
    }
}
