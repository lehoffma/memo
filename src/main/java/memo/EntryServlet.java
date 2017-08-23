package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.Entry;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;


@WebServlet(name = "EntryServlet",value = "/api/entry")
public class EntryServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement
        setContentType(request,response);

        String Sid = request.getParameter("id");
        String SeventId = request.getParameter("eventId");
        String sType;

        List<Entry> entries = getEntriesFromDatabase(Sid,SuserId,response);

        if (entries.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }
        //ToDo: OrderedItems

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(entries);

        response.getWriter().append("{ \"entries\": " + output + " }");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement

        setContentType(request,response);

        JsonObject jEntry = getJsonEntry(request,response);

        Entry e = createEntryFromJson(jEntry);

        saveEntryToDatabase(e);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");

        System.out.println(e.toString());

    }



    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement
        setContentType(request,response);

        JsonObject jEntry = getJsonEntry(request,response);

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement
        setContentType(request,response);
    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private JsonObject getJsonEntry(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("entry");
    }

    private Entry createEntryFromJson(JsonObject jEntry) {
        return updateEntryFromJson(jEntry,new Entry());
    }

    private Entry updateEntryFromJson(JsonObject jEntry, Entry entry){

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        // save params to new user
        entry = gson.fromJson(jEntry, Entry.class);

        entry.setEntryCategoryID(jEntry.get("category").getAsJsonObject().get("id").getAsInt());

        return entry;
    }

    private void saveEntryToDatabase(Entry e) {
        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.merge(e);
        em.getTransaction().commit();
    }

}
