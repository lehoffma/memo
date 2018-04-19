package memo.serialization;

import memo.data.CommentRepository;
import memo.data.Repository;
import memo.model.Comment;

public class CommentIdDeserializer extends IdDeserializer<Comment> {
    public CommentIdDeserializer() {
        super(CommentRepository::getInstance, Repository::getById, Comment.class);
    }
}
