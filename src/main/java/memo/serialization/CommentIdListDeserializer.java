package memo.serialization;

import memo.data.CommentRepository;
import memo.data.Repository;
import memo.model.Comment;

public class CommentIdListDeserializer extends IdListDeserializer<Comment> {
    public CommentIdListDeserializer() {
        super(CommentRepository::getInstance, Repository::getById, Comment.class);
    }
}
