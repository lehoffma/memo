package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;
import memo.model.Event;

/**
 * Entity implementation class for Entity: Size
 *
 */
@Entity
@Table(name = "SIZES")

public class Size implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(cascade = { CascadeType.REMOVE })
	@JoinColumn(name = "EVENT_ID")
	private Event event;
	private String name;
	@Column(name = "STOCK")
	private Integer NumInStock;
	private static final long serialVersionUID = 1L;

	public Size() {
		super();
	}

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Event getEvent() {
		return this.event;
	}

	public void setEvent(Event event) {
		this.event = event;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getNumInStock() {
		return this.NumInStock;
	}

	public void setNumInStock(Integer NumInStock) {
		this.NumInStock = NumInStock;
	}

}
