package memo.model;


import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.serialization.*;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "COMMENTS")
public class Comment implements Serializable {

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    //**************************************************************
    //  members
    //**************************************************************

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;   //globale unique ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "ITEM")
    @JsonDeserialize(using = ShopItemIdDeserializer.class)
    @JsonSerialize(using = ShopItemIdSerializer.class)
    private ShopItem item;

    @Column(nullable = false)
    private LocalDateTime timeStamp;   //muss jetzt unbedingt nich 'Date' sein, aber halt nen Datumstyp

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "AUTHOR")
    @JsonSerialize(using = UserIdSerializer.class)
    @JsonDeserialize(using = UserIdDeserializer.class)
    private User author;

    @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
    @JoinColumn(name = "CHILDREN")
    @JsonSerialize(using = CommentIdListSerializer.class)
    @JsonDeserialize(using = CommentIdListDeserializer.class)
    private List<Comment> children = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonSerialize(using = CommentIdSerializer.class)
    @JsonDeserialize(using = CommentIdDeserializer.class)
    private Comment parent;

    @Column(nullable = false)
    private String content;

    //**************************************************************
    //  constructor
    //**************************************************************

    public Comment() {
        super();
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public ShopItem getItem() {
        return item;
    }

    public void setItem(ShopItem item) {
        this.item = item;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public List<Comment> getChildren() {
        return children;
    }

    public void setChildren(List<Comment> children) {
        this.children = children;
    }

    public void addChild(Comment c) {
        this.children.add(c);
    }

    public Comment getParent() {
        return parent;
    }

    public void setParent(Comment parent) {
        this.parent = parent;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Comment{" +
                "id=" + id +
                ", itemId=" + item +
                ", timeStamp=" + timeStamp +
                ", children=" + children.size() +
                ", content='" + content + '\'' +
                '}';
    }
}
