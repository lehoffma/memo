package memo.model;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Created by DE165159 on 15.05.2017.
 */
@Entity
@Table(name = "HAS_COLOR")

@IdClass(HasColorPK.class)
public class HasColor implements Serializable {



        @Id
        @Column(name= "EVENT_ID")
        private Integer eventID;

        @ManyToOne(cascade = { CascadeType.PERSIST })
        @PrimaryKeyJoinColumn(name = "EVENT_ID", referencedColumnName = "ID")
        private Event event;

        @Id
        @Column(name= "COLOR_ID")
        private Integer colorID;

        @ManyToOne(cascade = { CascadeType.PERSIST})
        @PrimaryKeyJoinColumn(name = "COLOR_ID", referencedColumnName = "ID")
        private Color color;

        private static final long serialVersionUID = 1L;
}
