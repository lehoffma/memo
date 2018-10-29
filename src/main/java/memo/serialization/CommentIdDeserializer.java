package memo.serialization;

import memo.data.CommentRepository;
import memo.data.Repository;
import memo.model.Comment;

public class CommentIdDeserializer extends IdDeserializer<Comment, CommentRepository> {
    public CommentIdDeserializer() {
        super(CommentRepository.class, Repository::getById, Comment.class);
    }
}
