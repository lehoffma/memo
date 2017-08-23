package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: EntryCategory
 *
 */
@Entity
@Table(name="ENTRIES")

@NamedQueries({ 
	@NamedQuery(name = "getEntryById", query = "SELECT e FROM EntryCategory e WHERE e.id = :id"),
	@NamedQuery(name = "getEntry", query = "SELECT e FROM EntryCategory e")
})
public class EntryCategory implements Serializable {


	@Id
	private Integer id;
	private String name;
	private Integer category;
	private static final long serialVersionUID = 1L;

	public EntryCategory() {
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
	public Integer getCategory() {
		return this.category;
	}

	public void setCategory(Integer category) {
		this.category = category;
	}
   
}
