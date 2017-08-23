package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.Comment;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

@WebServlet(name = "CommentServlet", value = "/api/comment")
public class CommentServlet extends HttpServlet {


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String Sid = request.getParameter("id");
        String SEventID = request.getParameter("eventId");
        String SAuthorID = request.getParameter("authorId");

        List<Comment> comments = getCommentsFromDatabase(Sid,SEventID, SAuthorID, response);

        /*
        if(comments.isEmpty()){
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }
        */

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output=gson.toJson(comments);
        response.getWriter().append("{ \"comments\": "+ output + " }");

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        JsonObject jComment = getJsonComment(request,response);

        Comment c = createCommentFromJson(jComment);
        saveCommentToDatabase(c);

        System.out.println(c);

        response.setStatus(201);
        response.getWriter().append("{\"id\": "+c.getId()+"}");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        JsonObject jComment = getJsonComment(request,response);


        if(!jComment.getAsJsonObject().has("id")){
            response.setStatus(400);
            response.getWriter().append("invalid data");
            return;
        }

        Comment c = getCommentByID(jComment.get("id").getAsString(),response);

        if(c==null){
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }


        c = updateCommentFromJson(jComment,c);
        c = saveCommentToDatabase(c);

        System.out.println(c);

        response.setStatus(201);
        response.getWriter().append("{\"id\": "+c.getId()+"}");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String Sid = request.getParameter("id");

        Comment c = getCommentByID(Sid,response);

        if (c == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeCommentFromDatabase(c);

    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<Comment> getCommentsFromDatabase(String Sid, String SEventID, String SAuthorID, HttpServletResponse response) throws IOException {

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {
            Comment c = getCommentByID(Sid, response);
            if (c != null) {
                List<Comment> addresses = new ArrayList<>();
                addresses.add(c);
                return addresses;
            }
        }

        if (isStringNotEmpty(SEventID)) return getCommentsByEventID(SEventID,response);
        if (isStringNotEmpty(SAuthorID)) return getCommentsByAuthorID(SAuthorID,response);

        return getComments();

    }

    private Comment getCommentByID(String Sid, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(Sid);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().find(Comment.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<Comment> getComments() {
        return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c", Comment.class).getResultList();
    }

    private JsonObject getJsonComment(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("comment");
    }

    private Comment createCommentFromJson(JsonObject jComment) {

        return updateCommentFromJson(jComment,new Comment());
    }

    private Comment updateCommentFromJson(JsonObject jComment, Comment c) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        c = gson.fromJson(jComment, Comment.class);

        c.setTimeStamp(new Timestamp(Calendar.getInstance().getTimeInMillis()));

        return c;
    }

    private Comment saveCommentToDatabase(Comment c) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.merge(c);
        em.getTransaction().commit();
        return c;
    }

    private void removeCommentFromDatabase(Comment c)	{

        DatabaseManager.createEntityManager().getTransaction().begin();
        c = DatabaseManager.createEntityManager().merge(c);
        DatabaseManager.createEntityManager().remove(c);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }

    private List<Comment> getCommentsByEventID(String SEventID, HttpServletResponse response) throws IOException {
        try {
            Integer eventID = Integer.parseInt(SEventID);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c " +
                    " WHERE c.eventId = :eventID", Comment.class)
                    .setParameter("eventID",  eventID)
                    .getResultList();
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<Comment> getCommentsByAuthorID(String SAuthorID, HttpServletResponse response) throws IOException {
        try {
            Integer authorID = Integer.parseInt(SAuthorID);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().createQuery("SELECT c FROM Comment c " +
                    " WHERE c.authorId = :authorID", Comment.class)
                    .setParameter("authorID", "%" + authorID + "%")
                    .getResultList();
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }
}
