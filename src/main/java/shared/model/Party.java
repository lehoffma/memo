package shared.model;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

/**
 * Created by gzae on 12/13/16.
 */
public class Party extends Event{

    public int emptySeats;
    private List<User> participants;

    public Party(){
        super();
    }
}
