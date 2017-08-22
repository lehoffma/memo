package memo.model;


import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "COMMENTS")
public class Comment implements Serializable{

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int id;   //globale unique ID

    @ManyToOne(cascade = { CascadeType.PERSIST })
    @PrimaryKeyJoinColumn(name = "EVENT_ID", referencedColumnName = "ID")
    private Event event;

    @Column(nullable=false)
    private Timestamp timeStamp;   //muss jetzt unbedingt nich 'Date' sein, aber halt nen Datumstyp

    @ManyToOne(cascade = { CascadeType.PERSIST })
    @PrimaryKeyJoinColumn(name = "AUTHOR_ID", referencedColumnName = "ID")
    private User author;

    private String text;



    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Timestamp getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(Timestamp timeStamp) {
        this.timeStamp = timeStamp;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
