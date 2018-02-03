package memo.serialization;

import memo.model.Comment;

public class CommentIdListSerializer extends IdListSerializer<Comment, Integer> {
    public CommentIdListSerializer() {
        super(Comment::getId, Comment.class);
    }
}
