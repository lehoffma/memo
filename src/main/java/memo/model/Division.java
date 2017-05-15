package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: Division
 *
 */
@Entity
@Table(name="DIVISIONS")

@NamedQueries({ 
	@NamedQuery(name = "getDivisionById", query = "SELECT d FROM Division d WHERE d.id = :id"), 
	@NamedQuery(name = "getDivision", query = "SELECT d FROM Division d") 
})
public class Division implements Serializable {

	   
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	@Column(nullable=false)
	private String name;
	private static final long serialVersionUID = 1L;

	public Division() {
		super();
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
   
}
