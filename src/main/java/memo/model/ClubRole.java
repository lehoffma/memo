package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: ClubRole
 *
 */
@Entity
@Table(name="CLUBROLES")
@NamedQueries({ 
	@NamedQuery(name = "getClubRoleById", query = "SELECT c FROM ClubRole c WHERE c.id = :id"), 
	@NamedQuery(name = "getClubRole", query = "SELECT c FROM ClubRole c") 
})
public class ClubRole implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(nullable=false)
	private String name;
	private static final long serialVersionUID = 1L;

	public ClubRole() {
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
