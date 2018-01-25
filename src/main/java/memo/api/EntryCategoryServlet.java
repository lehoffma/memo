package memo.api;

import memo.model.EntryCategory;
import memo.util.ApiUtils;
import org.apache.log4j.Logger;

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

    final static Logger logger = Logger.getLogger(EntryCategoryServlet.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);
        List<EntryCategory> entries = createTestData();

        logger.debug("Method GET called");

        if (request.getParameter("categoryId") != null) {
            entries = entries.stream()
                    .filter(entryCategory -> Objects.equals(entryCategory.getId().toString(), request.getParameter("categoryId")))
                    .collect(Collectors.toList());
        }
        ApiUtils.getInstance().serializeObject(response,entries, "categories");

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
