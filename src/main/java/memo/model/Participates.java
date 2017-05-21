package memo.model;

import java.io.Serializable;
import java.lang.Boolean;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;
import memo.model.Event;
import memo.model.User;

/**
 * Entity implementation class for Entity: Participates
 *
 */
@Entity
@Table(name="PARTICIPATES")
@IdClass(ParticipatesPK.class)
public class Participates implements Serializable {

	@Id
	@Column(name = "USER_ID")
	private Integer userID;

	@ManyToOne(cascade = { CascadeType.PERSIST })
	@PrimaryKeyJoinColumn(name = "USER_ID", referencedColumnName = "ID")
	private User user;

	@Id
	@Column(name = "EVENT_ID")
	private Integer eventID;

	@ManyToOne(cascade = { CascadeType.PERSIST })
	@PrimaryKeyJoinColumn(name = "EVENT_ID", referencedColumnName = "ID")
	private Event event;

	@Column(name = "IS_DRIVER")
	private Boolean isDriver = false;

	@Column(nullable = false, name = "OUTSTANDING_PAYMENT")
	private Integer outstandingPayment;

	@Column(nullable = false, name = "TICKETS")
	private Integer numOfTickets;

	@Column(nullable = false, name = "PARTICIPANTS")
	private Integer numOfParticipants;

	@Lob
	private String comment;

	@Column(name = "IS_AUTHOR")
	private Boolean isAuthor = false;
	private static final long serialVersionUID = 1L;

	public Participates() {
		super();
	}

	public Integer getUserID() {
		return this.userID;
	}

	public void setUserID(Integer userID) {
		this.userID = userID;
	}

	public User getUser() {
		return this.user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Integer getEventID() {
		return this.eventID;
	}

	public void setEventID(Integer eventID) {
		this.eventID = eventID;
	}

	public Event getEvent() {
		return this.event;
	}

	public void setEvent(Event event) {
		this.event = event;
	}

	public Boolean getIsDriver() {
		return this.isDriver;
	}

	public void setIsDriver(Boolean isDriver) {
		this.isDriver = isDriver;
	}

	public Integer getOutstandingPayment() {
		return this.outstandingPayment;
	}

	public void setOutstandingPayment(Integer outstandingPayment) {
		this.outstandingPayment = outstandingPayment;
	}

	public Integer getNumOfTickets() {
		return this.numOfTickets;
	}

	public void setNumOfTickets(Integer numOfTickets) {
		this.numOfTickets = numOfTickets;
	}

	public Integer getNumOfParticipants() {
		return this.numOfParticipants;
	}

	public void setNumOfParticipants(Integer numOfParticipants) {
		this.numOfParticipants = numOfParticipants;
	}

	public String getComment() {
		return this.comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public Boolean getIsAuthor() {
		return isAuthor;
	}

	public void setIsAuthor(Boolean isAuthor) {
		this.isAuthor = isAuthor;
	}

}
