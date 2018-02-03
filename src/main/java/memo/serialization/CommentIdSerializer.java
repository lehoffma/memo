package memo.serialization;

import memo.model.Comment;

public class CommentIdSerializer extends IdSerializer<Comment, Integer> {
    public CommentIdSerializer() {
        super(Comment::getId, Comment.class);
    }
}
