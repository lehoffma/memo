package memo.model;

import java.io.Serializable;

/**
 * ID class for entity: PermissionState
 *
 */
public class PermissionStatePK implements Serializable {

	private static final long serialVersionUID = 1L;
	private Integer divisionID;
	private Integer userID;

	public PermissionStatePK() {
	}

	public Integer getDivisionID() {
		return divisionID;
	}

	public void setDivisionID(Integer divisionID) {
		this.divisionID = divisionID;
	}

	public Integer getUserID() {
		return userID;
	}

	public void setUserID(Integer userID) {
		this.userID = userID;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((divisionID == null) ? 0 : divisionID.hashCode());
		result = prime * result + ((userID == null) ? 0 : userID.hashCode());
		return result;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (!(obj instanceof PermissionStatePK)) {
			return false;
		}
		PermissionStatePK other = (PermissionStatePK) obj;
		if (divisionID == null) {
			if (other.divisionID != null) {
				return false;
			}
		} else if (!divisionID.equals(other.divisionID)) {
			return false;
		}
		if (userID == null) {
			if (other.userID != null) {
				return false;
			}
		} else if (!userID.equals(other.userID)) {
			return false;
		}
		return true;
	}
}