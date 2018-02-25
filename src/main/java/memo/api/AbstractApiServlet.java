package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.api.AuthenticationStrategy;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public abstract class AbstractApiServlet<T> extends HttpServlet {
    protected AuthenticationStrategy<T> authenticationStrategy;
    protected Logger logger = Logger.getLogger(AbstractApiServlet.class);

    public AbstractApiServlet(AuthenticationStrategy<T> authenticationStrategy) {
        super();
        this.authenticationStrategy = authenticationStrategy;
    }

    /**
     * Transforms the given parameter map to a string representation for logging purposes
     *
     * @param paramMap the map returned by request.getParameterMap(), contains key-value-pairs of all request parameters
     * @return
     */
    protected String paramMapToString(Map<String, String[]> paramMap) {
        return paramMap.entrySet().stream()
                .map(stringEntry -> stringEntry.getKey() + " = "
                        + Stream.of(stringEntry.getValue()).collect(Collectors.joining(" | ")))
                .collect(Collectors.joining(" + "));
    }

    protected String getParameter(Map<String, String[]> paramMap, String key, String defaultValue) {
        return Optional.ofNullable(paramMap.get(key)).map(it -> it[0]).orElse(defaultValue);
    }

    protected String getParameter(Map<String, String[]> paramMap, String key) {
        return getParameter(paramMap, key, "");
    }

    protected void get(HttpServletRequest request,
                       HttpServletResponse response,
                       BiFunction<Map<String, String[]>, HttpServletResponse, List<T>> itemSupplier,
                       String serializedKey,
                       Predicate<T> isFiltered
    ) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method GET called with params " + paramMapToString(parameterMap));
        List<T> items = itemSupplier.apply(parameterMap, response);

        items = AuthenticationService.filterUnauthorized(
                items,
                this.authenticationStrategy::isAllowedToRead,
                request
        );

        items = items.stream()
                .filter(isFiltered)
                .collect(Collectors.toList());

        String id = getParameter(parameterMap, "id");
        if (ApiUtils.stringIsNotEmpty(id) && items.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, items, serializedKey);
    }

    protected void get(HttpServletRequest request,
                       HttpServletResponse response,
                       BiFunction<Map<String, String[]>, HttpServletResponse, List<T>> itemSupplier,
                       String serializedKey) {
        this.get(request, response, itemSupplier, serializedKey, t -> true);
    }

    protected <SerializedType> void post(HttpServletRequest request,
                                         HttpServletResponse response,
                                         String objectName,
                                         T baseValue,
                                         Class<T> clazz,
                                         BiConsumer<JsonNode, T> updateDependencies,
                                         List<ModifyPrecondition<T>> preconditions,
                                         Function<T, SerializedType> getSerialized,
                                         String serializedKey
    ) {
        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jsonItem = ApiUtils.getInstance().getJsonObject(request, objectName);
        logger.debug("Method POST called with params " + paramMapToString(request.getParameterMap()));

        //ToDo: Duplicate Items :/
        T item = ApiUtils.getInstance().updateFromJson(jsonItem, baseValue, clazz);

        //check if user is authorized to create item
        if (!AuthenticationService.userIsAuthorized(request, authenticationStrategy::isAllowedToCreate, item)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to create this item");
            return;
        }

        Optional<ModifyPrecondition<T>> failedCondition = preconditions.stream()
                .filter(it -> it.getPredicate().test(item)).findFirst();

        if (handleFailedCondition(failedCondition)) {
            return;
        }

        //update cyclic dependencies etc.
        updateDependencies.accept(jsonItem, item);

        DatabaseManager.getInstance().save(item);

        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, getSerialized.apply(item), serializedKey);
    }

    protected <SerializedType> void post(HttpServletRequest request, HttpServletResponse response,
                                         ApiServletPostOptions<T, SerializedType> options) {
        this.post(request, response,
                options.getObjectName(),
                options.getBaseValue(),
                options.getClazz(),
                options.getUpdateDependencies(),
                options.getPreconditions(),
                options.getGetSerialized(),
                options.getSerializedKey()
        );
    }

    protected <SerializedType> void put(HttpServletRequest request, HttpServletResponse response,
                                        String objectName,
                                        String jsonId,
                                        Class<T> clazz,
                                        BiConsumer<JsonNode, T> updateDependencies,
                                        List<ModifyPrecondition<T>> preconditions,
                                        Function<T, SerializedType> getSerialized,
                                        String serializedKey) {
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called with params " + paramMapToString(request.getParameterMap()));
        JsonNode jsonItem = ApiUtils.getInstance().getJsonObject(request, objectName);

        if (!jsonItem.has(jsonId)) {
            ApiUtils.getInstance().processInvalidError(response);
            return;
        }

        T item = DatabaseManager.getInstance().getById(clazz, jsonItem.get(jsonId).asInt());

        //check if user is authorized to modify item
        if (!AuthenticationService.userIsAuthorized(request, authenticationStrategy::isAllowedToModify, item)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to modify this shop item");
            return;
        }

        T finalItem = item;
        Optional<ModifyPrecondition<T>> failedCondition = preconditions.stream()
                .filter(it -> it.getPredicate().test(finalItem)).findFirst();

        if (handleFailedCondition(failedCondition)) {
            return;
        }

        if (item == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }

        item = ApiUtils.getInstance().updateFromJson(jsonItem, item, clazz);

        //update cyclic dependencies etc.
        updateDependencies.accept(jsonItem, item);

        DatabaseManager.getInstance().save(item);

        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, getSerialized.apply(item), serializedKey);
    }

    @SuppressWarnings("OptionalUsedAsFieldOrParameterType")
    private boolean handleFailedCondition(Optional<ModifyPrecondition<T>> failedCondition) {
        if (failedCondition.isPresent()) {
            ModifyPrecondition<T> condition = failedCondition.get();
            condition.getConsequence().run();
            logger.error(condition.getErrorMessage());
            return true;
        }
        return false;
    }

    protected <SerializedType> void put(HttpServletRequest request, HttpServletResponse response,
                                        ApiServletPutOptions<T, SerializedType> options) {
        this.put(request, response,
                options.getObjectName(),
                options.getJsonId(),
                options.getClazz(),
                options.getUpdateDependencies(),
                options.getPreconditions(),
                options.getGetSerialized(),
                options.getSerializedKey()
        );
    }

    protected void delete(Class<T> clazz,
                          HttpServletRequest request,
                          HttpServletResponse response) {
        ApiUtils.getInstance().setContentType(request, response);
        String id = request.getParameter("id");
        logger.debug("Method DELETE called with params " + paramMapToString(request.getParameterMap()));

        T itemToDelete = DatabaseManager.getInstance().getById(clazz, Integer.valueOf(id));

        boolean isAuthorized = AuthenticationService.parseUserFromRequestHeader(request)
                .map(user -> authenticationStrategy.isAllowedToDelete(user, itemToDelete))
                .orElse(false);

        if (!isAuthorized) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to modify this shop item");
            return;
        }

        if (itemToDelete == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        logger.debug("Object: " + itemToDelete.toString() + " will be removed");
        DatabaseManager.getInstance().remove(itemToDelete);
    }
}
