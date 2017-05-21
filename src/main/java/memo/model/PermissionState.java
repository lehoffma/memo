package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import javax.persistence.*;
import memo.model.Division;
import memo.model.Permission;
import memo.model.User;

/**
 * Entity implementation class for Entity: PermissionState
 *
 */
@Entity
@Table(name = "HAS_PERMISSION")

@IdClass(PermissionStatePK.class)
public class PermissionState implements Serializable {

	@Id
	@Column(name = "DIVISION_ID")
	private Integer divisionID;

	@Id
	@Column(name = "USER_ID")
	private Integer userID;

	@ManyToOne(cascade = { CascadeType.REMOVE })
	@PrimaryKeyJoinColumn(name = "DIVISION_ID", referencedColumnName = "ID")
	private Division division;

	@ManyToOne(cascade = { CascadeType.REMOVE })
	@PrimaryKeyJoinColumn(name = "USER_ID", referencedColumnName = "ID")
	private User user;

	@ManyToOne
	@JoinColumn(nullable = false, name = "PERMISSION_STATE_ID", referencedColumnName = "ID")
	private Permission permissionState;
	private static final long serialVersionUID = 1L;

	public PermissionState() {
		super();
	}

	public Division getDivision() {
		return this.division;
	}

	public void setDivision(Division division) {
		this.division = division;
	}

	public User getUser() {
		return this.user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Integer getDivisionID() {
		return this.divisionID;
	}

	public void setDivisionID(Integer divisionID) {
		this.divisionID = divisionID;
	}

	public Integer getUserID() {
		return this.userID;
	}

	public void setUserID(Integer userID) {
		this.userID = userID;
	}

	public Permission getPermissionState() {
		return this.permissionState;
	}

	public void setPermissionState(Permission permissionState) {
		this.permissionState = permissionState;
	}

}
