package memo.model;

import com.google.gson.annotations.Expose;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import java.sql.Timestamp;

import javax.persistence.*;

/**
 * Entity implementation class for Entity: Event
 *
 */
@Entity
@Table(name = "EVENTS")
public class Event implements Serializable {

	@Expose
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

	@Enumerated(EnumType.ORDINAL)
	private ClubRole expectedReadRole;

	@Enumerated(EnumType.ORDINAL)
	private ClubRole expectedCheckinRole;

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
	private Integer priceMember;

	@Expose
	@Column(nullable = false)
	private Integer price;

	@ManyToOne
	@JoinColumn(name = "MEETING_POINT_ID", nullable = false)
	private Address meetingPoint;

	@ManyToOne
	@JoinColumn(name = "DESTINATION_ID")
	private Address destination;




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

	public Integer getPriceMember() {
		return this.priceMember;
	}

	public void setPriceMember(Integer priceMember) {
		this.priceMember = priceMember;
	}

	public Address getMeetingPoint() {
		return this.meetingPoint;
	}

	public void setMeetingPoint(Address meetingPoint) {
		this.meetingPoint = meetingPoint;
	}

	public Integer getPrice() {
		return this.price;
	}

	public void setPrice(Integer price) {
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

	public Address getDestination() {
		return this.destination;
	}

	public void setDestination(Address destination) {
		this.destination = destination;
	}

	public Integer getType() {
		return type;
	}

	public void setType(Integer type) {
		this.type = type;
	}

	public ClubRole getExpectedCheckinRole() {
		return expectedCheckinRole;
	}

	public void setExpectedCheckinRole(ClubRole expectedCheckinRole) {
		this.expectedCheckinRole = expectedCheckinRole;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

	@Override
	public String toString() {
		return "Event{" +
				"id=" + id +
				", title='" + title + '\'' +
				", date=" + date +
				", description='" + description + '\'' +
				", expectedReadRole=" + expectedReadRole +
				", expectedWriteRole=" + expectedWriteRole +
				", imagePath='" + imagePath + '\'' +
				", capacity=" + capacity +
				", priceMember=" + priceMember +
				", price=" + price +
				", meetingPoint=" + meetingPoint +
				", destination=" + destination +
				", material='" + material + '\'' +
				", vehicle='" + vehicle + '\'' +
				", miles=" + miles +
				", type=" + type +
				'}';
	}
}
