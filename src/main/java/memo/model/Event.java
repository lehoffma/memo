package memo.model;

import com.google.gson.annotations.Expose;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.*;

/**
 * Entity implementation class for Entity: Event
 *
 */
@Entity
@Table(name = "EVENTS")
public class Event implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Expose
	@Column(nullable = false)
	private String title;


	@Column(nullable = false)
	private Timestamp date;

	@Expose
	@Lob
	@Column(nullable = false)
	private String description;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private ClubRole expectedReadRole;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private ClubRole expectedCheckInRole;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private ClubRole expectedWriteRole;

	@Expose
	@Column(name="IMAGE_PATH")
	private String imagePath;

	@Expose
	@Column(nullable = false)
	private Integer capacity;

	@Expose
	@Column(name = "PRICE_MEMBER", nullable = false)
	private float priceMember;

	@Expose
	@Column(nullable = false)
	private float price;

    @ElementCollection
    @CollectionTable(name ="EVENT_ROUTES")
    @Expose
    private List<Integer> route = new ArrayList<>();


	@Expose
	private String material;
	@Expose
	private String vehicle;
	@Expose
	private Integer miles = 0;

	@Expose
	@Column(nullable=false)
	private Integer type;

	private static final long serialVersionUID = 1L;

	public Event() {
		super();
	}

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getTitle() {
		return this.title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Timestamp getDate() {
		return this.date;
	}

	public void setDate(Timestamp date) {
		this.date = date;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ClubRole getExpectedReadRole() {
		return this.expectedReadRole;
	}

	public void setExpectedReadRole(ClubRole expectedReadRole) {
		this.expectedReadRole = expectedReadRole;
	}

	public ClubRole getExpectedWriteRole() {
		return this.expectedWriteRole;
	}

	public void setExpectedWriteRole(ClubRole expectedWriteRole) {
		this.expectedWriteRole = expectedWriteRole;
	}

	public Integer getCapacity() {
		return this.capacity;
	}

	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}

	public float getPriceMember() {
		return this.priceMember;
	}

	public void setPriceMember(float priceMember) {
		this.priceMember = priceMember;
	}

	public float getPrice() {
		return this.price;
	}

	public void setPrice(float price) {
		this.price = price;
	}

	public String getMaterial() {
		return this.material;
	}

	public void setMaterial(String material) {
		this.material = material;
	}

	public String getVehicle() {
		return this.vehicle;
	}

	public void setVehicle(String vehicle) {
		this.vehicle = vehicle;
	}

	public Integer getMiles() {
		return this.miles;
	}

	public void setMiles(Integer miles) {
		this.miles = miles;
	}

	public Integer getType() {
		return type;
	}

	public void setType(Integer type) {
		this.type = type;
	}

	public ClubRole getExpectedCheckInRole() {
		return expectedCheckInRole;
	}

	public void setExpectedCheckInRole(ClubRole expectedCheckinRole) {
		this.expectedCheckInRole = expectedCheckinRole;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

    public List<Integer> getRoute() {
        return route;
    }

    public void setRoute(List<Integer> route) {
        for (Integer a : route) {
            this.route.add(a);
        }
    }

    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", date=" + date +
                ", description='" + description + '\'' +
                ", expectedReadRole=" + expectedReadRole +
                ", expectedCheckInRole=" + expectedCheckInRole +
                ", expectedWriteRole=" + expectedWriteRole +
                ", imagePath='" + imagePath + '\'' +
                ", capacity=" + capacity +
                ", priceMember=" + priceMember +
                ", price=" + price +
                ", route=" + route +
                ", material='" + material + '\'' +
                ", vehicle='" + vehicle + '\'' +
                ", miles=" + miles +
                ", type=" + type +
                '}';
    }
}
