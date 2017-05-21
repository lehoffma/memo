package memo.model;

import java.io.Serializable;


/**
 * ID class for entity: HasColor
 *
 */
public class HasColorPK implements Serializable{

    private static final long serialVersionUID = 1L;
    private Integer eventID;
    private Integer colorID;

    public HasColorPK() {
    }

    public Integer getEventID() {
        return eventID;
    }

    public void setEventID(Integer eventID) {
        this.eventID = eventID;
    }

    public Integer getColorID() {
        return colorID;
    }

    public void setColorID(Integer colorID) {
        this.colorID = colorID;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((eventID == null) ? 0 : eventID.hashCode());
        result = prime * result + ((colorID == null) ? 0 : colorID.hashCode());
        return result;
    }
}