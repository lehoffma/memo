package memo;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import memo.model.Entry;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "EntryCategoryServlet",value = "/api/entryCategory")
public class EntryCategoryServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);
        List<Entry> entries = createTestData();



        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(entries);

        response.getWriter().append("{ \"categories\": " + output + " }");


    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private List<Entry> createTestData()
    {
        List<Entry> entries = new ArrayList<>();

        Entry a = new Entry();
        a.setName("Verpflegung");
        a.setCategory(1);
        a.setId(1);
        entries.add(a);
        Entry b = new Entry();
        b.setName("Tickets");
        b.setCategory(1);
        b.setId(2);
        entries.add(b);
        Entry c = new Entry();
        c.setName("Mietkosten");
        c.setCategory(1);
        c.setId(3);
        entries.add(c);
        Entry d = new Entry();
        d.setName("Steuern");
        d.setCategory(1);
        d.setId(3);
        entries.add(d);

        return entries;
    }
}
