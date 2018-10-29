package memo.serialization;

import memo.data.CommentRepository;
import memo.data.Repository;
import memo.model.Comment;

public class CommentIdListDeserializer extends IdListDeserializer<Comment, CommentRepository> {
    public CommentIdListDeserializer() {
        super(CommentRepository.class, Repository::getById, Comment.class);
    }
}
