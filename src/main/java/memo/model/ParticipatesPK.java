package memo.model;

import java.io.Serializable;

/**
 * ID class for entity: Participates
 *
 */
public class ParticipatesPK implements Serializable {

	private static final long serialVersionUID = 1L;
	private Integer userID;
	private Integer eventID;

	public ParticipatesPK() {
	}

	public Integer getUserID() {
		return userID;
	}

	public void setUserID(Integer userID) {
		this.userID = userID;
	}

	public Integer getEventID() {
		return eventID;
	}

	public void setEventID(Integer eventID) {
		this.eventID = eventID;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((userID == null) ? 0 : userID.hashCode());
		result = prime * result + ((eventID == null) ? 0 : eventID.hashCode());
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
		if (!(obj instanceof ParticipatesPK)) {
			return false;
		}
		ParticipatesPK other = (ParticipatesPK) obj;
		if (userID == null) {
			if (other.userID != null) {
				return false;
			}
		} else if (!userID.equals(other.userID)) {
			return false;
		}
		if (eventID == null) {
			if (other.eventID != null) {
				return false;
			}
		} else if (!eventID.equals(other.eventID)) {
			return false;
		}
		return true;
	}
}