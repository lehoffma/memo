package model;

import java.util.List;

/**
 * Created by gzae on 12/13/16.
 */
public class Tour extends Event{

    public String vehicle;
    public int miles;
    public String destination;
    public int emptySeats;
    public List<User> participants;


    public Tour(){
        super();
    }
}
