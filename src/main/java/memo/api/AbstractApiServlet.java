package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.DependencyUpdateService;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.api.AuthenticationStrategy;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static memo.util.ApiUtils.stringIsNotEmpty;

public abstract class AbstractApiServlet<T> extends HttpServlet {
    protected AuthenticationStrategy<T> authenticationStrategy;
    protected Logger logger = Logger.getLogger(AbstractApiServlet.class);
    private DependencyUpdateService dependencyUpdateService;

    public AbstractApiServlet(AuthenticationStrategy<T> authenticationStrategy) {
        super();
        this.authenticationStrategy = authenticationStrategy;
        this.dependencyUpdateService = new DependencyUpdateService();
    }

    /**
     * Updates the database record of a manyToOne relationship
     */
    protected <DependencyType, IdType> void manyToOne(T objectToUpdate,
                                                      Function<T, DependencyType> getDependency,
                                                      Function<T, IdType> getId,
                                                      Function<DependencyType, List<T>> getCyclicListDependency,
                                                      Function<DependencyType, Consumer<List<T>>> updateDependencyValues
    ) {
        dependencyUpdateService.manyToOne(objectToUpdate, getDependency, getId, getCyclicListDependency, updateDependencyValues)
                .ifPresent(it -> DatabaseManager.getInstance().update(it));
    }

    /**
     * Updates the database record of a oneToMany relationship
     */
    protected <DependencyType> void oneToMany(T objectToUpdate,
                                              Function<T, List<DependencyType>> getDependency,
                                              Function<DependencyType, Consumer<T>> updateDependencyValue
    ) {
        List<DependencyType> values = dependencyUpdateService
                .oneToMany(objectToUpdate, getDependency, updateDependencyValue);
        DatabaseManager.getInstance().updateAll(values);
    }

    /**
     * Updates the database record of a oneToOne relationship
     */
    protected <DependencyType> void oneToOne(T objectToUpdate,
                                             Function<T, DependencyType> getDependency,
                                             Function<DependencyType, Consumer<T>> updateDependencyValue) {
        dependencyUpdateService.oneToOne(objectToUpdate, getDependency, updateDependencyValue)
                .ifPresent(it -> DatabaseManager.getInstance().update(it));
    }

    /**
     * Updates the database record of a manyToMany relationship
     */
    protected <DependencyType, IdType> void manyToMany(T objectToUpdate,
                                                       Function<T, List<DependencyType>> getDependency,
                                                       Function<T, IdType> getId,
                                                       Function<DependencyType, List<T>> getCyclicListDependency,
                                                       Function<DependencyType, Consumer<List<T>>> updateDependencyValues
    ) {
        List<DependencyType> dependencyTypes = dependencyUpdateService.manyToMany(objectToUpdate, getDependency, getId, getCyclicListDependency, updateDependencyValues);
        DatabaseManager.getInstance().updateAll(dependencyTypes);
    }

    protected abstract void updateDependencies(JsonNode jsonNode, T object);

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
        return getParameter(paramMap, key, null);
    }

    protected List<T> get(HttpServletRequest request,
                       HttpServletResponse response,
                       BiFunction<Map<String, String[]>, HttpServletResponse, List<T>> itemSupplier,
                       String serializedKey,
                       Predicate<T> isFiltered
    ) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method GET called with params " + paramMapToString(parameterMap));
        List<T> items = itemSupplier.apply(parameterMap, response);

        items = items.stream()
                .filter(isFiltered)
                .collect(Collectors.toList());
        String id = getParameter(parameterMap, "id");

        if (stringIsNotEmpty(id) && items.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return new ArrayList<>();
        }

        //remove items from the result the user is not allowed to see
        items = AuthenticationService.filterUnauthorized(
                items,
                this.authenticationStrategy::isAllowedToRead,
                request
        );

        if (stringIsNotEmpty(id) && items.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to see this item");
            return new ArrayList<>();
        }

        ApiUtils.getInstance().serializeObject(response, items, serializedKey);
        return items;
    }

    protected List<T> get(HttpServletRequest request,
                       HttpServletResponse response,
                       BiFunction<Map<String, String[]>, HttpServletResponse, List<T>> itemSupplier,
                       String serializedKey) {
        return this.get(request, response, itemSupplier, serializedKey, t -> true);
    }

    protected <SerializedType> T post(HttpServletRequest request,
                                         HttpServletResponse response,
                                         String objectName,
                                         T baseValue,
                                         Class<T> clazz,
                                         Function<T, T> transform,
                                         List<ModifyPrecondition<T>> preconditions,
                                         Function<T, SerializedType> getSerialized,
                                         String serializedKey
    ) {
        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jsonItem = ApiUtils.getInstance().getJsonObject(request, objectName);
        logger.debug("Method POST called with params " + paramMapToString(request.getParameterMap()));

        //ToDo: Duplicate Items :/
        //perform transformations on the parsed item, i.e. hashing
        T item = transform.apply(
                ApiUtils.getInstance().updateFromJson(jsonItem, baseValue, clazz)
        );

        //check if user is authorized to create item
        if (!AuthenticationService.userIsAuthorized(request, authenticationStrategy::isAllowedToCreate, item)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to create this item");
            return null;
        }

        //check if any of the preconditions failed (i.e. the email is already taken or something)
        Optional<ModifyPrecondition<T>> failedCondition = preconditions.stream()
                .filter(it -> it.getPredicate().test(item)).findFirst();

        if (handleFailedCondition(failedCondition)) {
            return null;
        }

        DatabaseManager.getInstance().save(item);

        //update cyclic dependencies etc.
        this.updateDependencies(jsonItem, item);

        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, getSerialized.apply(item), serializedKey);
        return item;
    }

    protected <SerializedType> T post(HttpServletRequest request, HttpServletResponse response,
                                         ApiServletPostOptions<T, SerializedType> options) {
        return this.post(request, response,
                options.getObjectName(),
                options.getBaseValue(),
                options.getClazz(),
                options.getTransform(),
                options.getPreconditions(),
                options.getGetSerialized(),
                options.getSerializedKey()
        );
    }

    protected <SerializedType> T put(HttpServletRequest request, HttpServletResponse response,
                                        String objectName,
                                        String jsonId,
                                        Class<T> clazz,
                                        Function<T, T> transform,
                                        List<ModifyPrecondition<T>> preconditions,
                                        Function<T, SerializedType> getSerialized,
                                        String serializedKey) {
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called with params " + paramMapToString(request.getParameterMap()));
        JsonNode jsonItem = ApiUtils.getInstance().getJsonObject(request, objectName);

        if (!jsonItem.has(jsonId)) {
            ApiUtils.getInstance().processInvalidError(response);
            return null;
        }

        T item = transform.apply(
                DatabaseManager.getInstance().getById(clazz, jsonItem.get(jsonId).asInt())
        );

        //check if user is authorized to modify item
        if (!AuthenticationService.userIsAuthorized(request, authenticationStrategy::isAllowedToModify, item)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to modify this shop item");
            return null;
        }

        T finalItem = item;
        //check if any of the preconditions failed (i.e. the email is already taken or something)
        Optional<ModifyPrecondition<T>> failedCondition = preconditions.stream()
                .filter(it -> it.getPredicate().test(finalItem)).findFirst();

        if (handleFailedCondition(failedCondition)) {
            return null;
        }

        if (item == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return null;
        }

        item = ApiUtils.getInstance().updateFromJson(jsonItem, item, clazz);

        //update cyclic dependencies etc.
        this.updateDependencies(jsonItem, item);

        DatabaseManager.getInstance().save(item);

        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, getSerialized.apply(item), serializedKey);
        return finalItem;
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

    protected <SerializedType> T put(HttpServletRequest request, HttpServletResponse response,
                                        ApiServletPutOptions<T, SerializedType> options) {
        return this.put(request, response,
                options.getObjectName(),
                options.getJsonId(),
                options.getClazz(),
                options.getTransform(),
                options.getPreconditions(),
                options.getGetSerialized(),
                options.getSerializedKey()
        );
    }

    protected T delete(HttpServletRequest request,
                          HttpServletResponse response,
                          Function<HttpServletRequest, T> itemSupplier
    ) {
        ApiUtils.getInstance().setContentType(request, response);
        logger.debug("Method DELETE called with params " + paramMapToString(request.getParameterMap()));

        T itemToDelete = itemSupplier.apply(request);

        User user = AuthenticationService.parseNullableUserFromRequestHeader(request);
        boolean isAuthorized = authenticationStrategy.isAllowedToDelete(user, itemToDelete);

        if (!isAuthorized) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to modify this shop item");
            return null;
        }

        if (itemToDelete == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return null;
        }
        logger.debug("Object: " + itemToDelete.toString() + " will be removed");
        DatabaseManager.getInstance().remove(itemToDelete);
        return itemToDelete;
    }

    protected T delete(Class<T> clazz,
                          HttpServletRequest request,
                          HttpServletResponse response) {

        return this.delete(request, response, req -> {
            String id = request.getParameter("id");
            return DatabaseManager.getInstance().getById(clazz, Integer.valueOf(id));
        });
    }
}
