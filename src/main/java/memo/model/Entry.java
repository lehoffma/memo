package memo.model;

import com.google.gson.annotations.Expose;

import java.io.Serializable;
import java.lang.Boolean;
import java.lang.Integer;
import java.lang.String;
import java.sql.Date;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: Entry
 *
 */
@Entity
@Table(name="ENTRIES")

public class Entry implements Serializable {


	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne
	@JoinColumn(name= "EVENT_ID",referencedColumnName = "ID")
	private Event event;


	@Column(name= "ENTRY_CATEGORY_ID")
	private Integer entryCategoryID;

	@Expose
	private String name;

	@Expose
	private Integer value;

	@Expose
	@Column(name= "IS_INCOME")
	private Boolean isIncome;

	@Expose
	private String comment;

	@Expose
	private String picPath;

	private Date date;

	private static final long serialVersionUID = 1L;

	public Entry() {
		super();
	}   
	public Event getEvent() {
		return this.event;
	}

	public void setEvent(Event event) {
		this.event = event;
	}   

	public Integer getEntryCategoryID() {
		return this.entryCategoryID;
	}

	public void setEntryCategoryID(Integer entryID) {
		this.entryCategoryID = entryID;
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

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}
}
