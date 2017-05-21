package memo.model;

import java.io.Serializable;
import java.lang.Boolean;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;
import memo.model.Entry;
import memo.model.Event;

/**
 * Entity implementation class for Entity: HasEntry
 *
 */
@Entity
@Table(name="HAS_ENTRY")

@IdClass(HasEntryPK.class)
public class HasEntry implements Serializable {

	   
	@Id
	@Column(name= "EVENT_ID")
	private Integer eventID;
	
	@ManyToOne(cascade = { CascadeType.PERSIST })
	@PrimaryKeyJoinColumn(name = "EVENT_ID", referencedColumnName = "ID")
	private Event event;
	
	@Id
	@Column(name= "ENTRY_ID")
	private Integer entryID;
	
	@ManyToOne(cascade = { CascadeType.PERSIST})
	@PrimaryKeyJoinColumn(name = "ENTRY_ID", referencedColumnName = "ID")
	private Entry entry;
	private Integer value;
	
	@Column(name= "IS_INCOME")
	private Boolean isIncome;
	private String comment;
	private String picPath;

	private static final long serialVersionUID = 1L;

	public HasEntry() {
		super();
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
	public Integer getEntryID() {
		return this.entryID;
	}

	public void setEntryID(Integer entryID) {
		this.entryID = entryID;
	}   
	public Entry getEntry() {
		return this.entry;
	}

	public void setEntry(Entry entry) {
		this.entry = entry;
	}   
	public Integer getValue() {
		return this.value;
	}

	public void setValue(Integer amount) {
		this.value = amount;
	}   
	public Boolean getIsIncome() {
		return this.isIncome;
	}

	public void setIsIncome(Boolean isIncome) {
		this.isIncome = isIncome;
	}

	public Boolean getIncome() {
		return isIncome;
	}

	public void setIncome(Boolean income) {
		isIncome = income;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public String getPicPath() {
		return picPath;
	}

	public void setPicPath(String picPath) {
		this.picPath = picPath;
	}


}
