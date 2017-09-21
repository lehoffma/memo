package memo;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import memo.model.EntryCategory;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@WebServlet(name = "EntryCategoryServlet", value = "/api/entryCategory")
public class EntryCategoryServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);
        List<EntryCategory> entries = createTestData();

        if (request.getParameter("categoryId") != null) {
            entries = entries.stream()
                    .filter(entryCategory -> Objects.equals(entryCategory.getId().toString(), request.getParameter("categoryId")))
                    .collect(Collectors.toList());
        }

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(entries);

        response.getWriter().append("{ \"categories\": " + output + " }");


    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private List<EntryCategory> createTestData() {
        List<EntryCategory> entries = new ArrayList<>();

        EntryCategory a = new EntryCategory();
        a.setName("Verpflegung");
        a.setCategory(1);
        a.setId(1);
        entries.add(a);
        EntryCategory b = new EntryCategory();
        b.setName("Tickets");
        b.setCategory(1);
        b.setId(2);
        entries.add(b);
        EntryCategory c = new EntryCategory();
        c.setName("Mietkosten");
        c.setCategory(1);
        c.setId(3);
        entries.add(c);
        EntryCategory d = new EntryCategory();
        d.setName("Steuern");
        d.setCategory(1);
        d.setId(4);
        entries.add(d);
        EntryCategory e = new EntryCategory();
        e.setName("Sonstiges");
        e.setCategory(1);
        e.setId(5);
        entries.add(e);

        return entries;
    }
}
