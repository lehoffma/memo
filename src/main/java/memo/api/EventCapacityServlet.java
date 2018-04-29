package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.ConfigurableAuthStrategy;
import memo.data.CapacityService;
import memo.model.EventCapacity;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

@WebServlet(name = "EventCapacityServlet", value = "/api/capacity")
public class EventCapacityServlet extends AbstractApiServlet<EventCapacity> {
    public EventCapacityServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, EventCapacity object) {

    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //todo
        this.get(request, response, (paramMap, resp) -> CapacityService
                .get(Integer.valueOf(getParameter(paramMap, "id")))
                .map(Arrays::asList)
                .orElse(new ArrayList<>()), "capacity");
    }
}
