package memo.api;

import memo.data.EntryCategoryRepository;
import memo.model.EntryCategory;
import memo.util.ApiUtils;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@WebServlet(name = "EntryCategoryServlet", value = "/api/entryCategory")
public class EntryCategoryServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(EntryCategoryServlet.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);
        List<EntryCategory> entries = EntryCategoryRepository.getInstance().getAll();

        logger.debug("Method GET called");

        if (request.getParameter("categoryId") != null) {
            entries = EntryCategoryRepository.getInstance().get(request.getParameter("categoryId"));
        }
        ApiUtils.getInstance().serializeObject(response, entries, "categories");

    }
}
