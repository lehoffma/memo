package memo.model;


import com.google.gson.annotations.Expose;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "COMMENTS")
public class Comment implements Serializable{

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int id;   //globale unique ID

    @Expose
    @Column(name = "EVENT_ID")
    private Integer eventId;

    @Column(nullable=false)
    private Timestamp timeStamp;   //muss jetzt unbedingt nich 'Date' sein, aber halt nen Datumstyp

    @Expose
    @Column(name = "AUTHOR_ID")
    private Integer authorId;

    @Expose
    private String text;



    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getEvent() {
        return eventId;
    }

    public void setEvent(Integer event) {
        this.eventId = event;
    }

    public Timestamp getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(Timestamp timeStamp) {
        this.timeStamp = timeStamp;
    }

    public Integer getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Integer author) {
        this.authorId = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id=" + id +
                ", eventId=" + eventId +
                ", timeStamp=" + timeStamp +
                ", authorId=" + authorId +
                ", text='" + text + '\'' +
                '}';
    }
}
