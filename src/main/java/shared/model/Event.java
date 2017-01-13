package model;

import java.util.Date;

/**
 * Created by gzae on 12/13/16.
 */
public class Event {

    public int id;
    public String title;
    public Date date;
    public String description;
    public ClubRole expectedRole;
    public String picPath;
    public int capacity;
    public float priceMember;
    public float price;
    public Address meetingPoint;

    public Event(){

    }

}
