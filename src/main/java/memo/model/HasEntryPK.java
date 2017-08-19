package memo.model;

import java.io.Serializable;

/**
 * ID class for entity: HasEntry
 *
 */
public class HasEntryPK implements Serializable {

	private static final long serialVersionUID = 1L;
	private Integer eventID;
	private Integer entryID;

	public HasEntryPK() {
	}

	public Integer getEventID() {
		return eventID;
	}

	public void setEventID(Integer eventID) {
		this.eventID = eventID;
	}

	public Integer getEntryID() {
		return entryID;
	}

	public void setEntryID(Integer entryID) {
		this.entryID = entryID;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((eventID == null) ? 0 : eventID.hashCode());
		result = prime * result + ((entryID == null) ? 0 : entryID.hashCode());
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
		if (!(obj instanceof HasEntryPK)) {
			return false;
		}
		HasEntryPK other = (HasEntryPK) obj;
		if (eventID == null) {
			if (other.eventID != null) {
				return false;
			}
		} else if (!eventID.equals(other.eventID)) {
			return false;
		}
		if (entryID == null) {
			if (other.entryID != null) {
				return false;
			}
		} else if (!entryID.equals(other.entryID)) {
			return false;
		}
		return true;
	}
}