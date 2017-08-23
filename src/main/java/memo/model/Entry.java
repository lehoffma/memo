package memo.model;

import com.google.gson.annotations.Expose;

import java.io.Serializable;
import java.lang.Boolean;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: Entry
 *
 */
@Entity
@Table(name="ENTRIES")

public class Entry implements Serializable {


	@Id
	private Integer id;

	@Expose
	@Column(name= "EVENT_ID")
	private Integer eventID;


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

	private static final long serialVersionUID = 1L;

	public Entry() {
		super();
	}   
	public Integer getEventID() {
		return this.eventID;
	}

	public void setEventID(Integer eventID) {
		this.eventID = eventID;
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


}
