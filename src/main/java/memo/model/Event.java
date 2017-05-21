package memo.model;

import java.io.Serializable;
import java.lang.Byte;
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

@NamedQueries({ 
	@NamedQuery(name = "getMerch", query = "SELECT e FROM Event e WHERE e.type = 3"), 
	@NamedQuery(name = "getPartys", query = "SELECT e FROM Event e WHERE e.type = 2"),
	@NamedQuery(name = "getTours", query = "SELECT e FROM Event e WHERE e.type = 1"),
	@NamedQuery(name = "getEventByType", query = "SELECT e FROM Event e WHERE e.type = :type"),
	@NamedQuery(name = "getEventById", query = "SELECT e FROM Event e WHERE e.id = :id"),
	@NamedQuery(name = "getEvent", query = "SELECT e FROM Event e") 
})
public class Event implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private Timestamp date;

	@Lob
	@Column(nullable = false)
	private String description;

	@ManyToOne(cascade = { CascadeType.REFRESH })
	@JoinColumn(name = "EXPECTED_READ_ROLE", nullable = false)
	private ClubRole expectedReadRole;

	@ManyToOne(cascade = { CascadeType.REFRESH })
	@JoinColumn(name = "EXPECTED_WRITE_ROLE", nullable = false)
	private ClubRole expectedWriteRole;

	@Lob
	private Byte[] pic;

	@Column(nullable = false)
	private Integer capacity;

	@Column(name = "PRICE_MEMBER", nullable = false)
	private Integer priceMember;

	@ManyToOne
	@JoinColumn(name = "MEETING_POINT_ID", nullable = false)
	private Address meetingPoint;

	@ManyToOne
	@JoinColumn(name = "DESTINATION_ID")
	private Address destination;

	@Column(nullable = false)
	private Integer price;

	private String material;
	private String vehicle;
	private Integer miles = 0;

	private Integer stock;

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

	public Byte[] getPic() {
		return this.pic;
	}

	public void setPic(Byte[] pic) {
		this.pic = pic;
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

}
