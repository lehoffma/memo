package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.ConfigurableAuthStrategy;
import memo.data.EntryCategoryRepository;
import memo.model.EntryCategory;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "EntryCategoryServlet", value = "/api/entryCategory")
public class EntryCategoryServlet extends AbstractApiServlet<EntryCategory> {

    final static Logger logger = Logger.getLogger(EntryCategoryServlet.class);

    public EntryCategoryServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response, EntryCategoryRepository.getInstance(), "categories");
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, EntryCategory object) {
    }
}
