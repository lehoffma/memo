package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.*;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.AuthenticationStrategy;
import memo.communication.strategy.BaseNotificationStrategy;
import memo.communication.strategy.NotificationStrategy;
import memo.data.PagingAndSortingRepository;
import memo.data.model.SerializationOption;
import memo.data.util.CsvConverter;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.util.model.Filter;
import memo.util.model.Page;
import memo.util.model.PageRequest;
import memo.util.model.Sort;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

import static memo.util.ApiUtils.stringIsNotEmpty;

public abstract class AbstractApiServlet<T> extends HttpServlet {
    protected AuthenticationStrategy<T> authenticationStrategy;
    protected NotificationStrategy<T> notificationStrategy;
    protected Logger logger = LogManager.getLogger(AbstractApiServlet.class);
    private DependencyUpdateService dependencyUpdateService;

    public AbstractApiServlet(AuthenticationStrategy<T> authenticationStrategy) {
        super();
        this.authenticationStrategy = authenticationStrategy;
        this.notificationStrategy = new BaseNotificationStrategy<>();
        this.dependencyUpdateService = new DependencyUpdateService();
    }

    public AbstractApiServlet(AuthenticationStrategy<T> authenticationStrategy, NotificationStrategy<T> notificationStrategy) {
        super();
        this.authenticationStrategy = authenticationStrategy;
        this.notificationStrategy = notificationStrategy;
        this.dependencyUpdateService = new DependencyUpdateService();
    }

    protected T createCopy(T object) {
        return object;
    }

    /**
     * Updates the database record of a manyToOne relationship
     */
    protected <DependencyType, IdType, ObjectType> void manyToOne(ObjectType objectToUpdate,
                                                                  Class<DependencyType> clazz,
                                                                  Function<ObjectType, DependencyType> getDependency,
                                                                  Function<ObjectType, IdType> getId,
                                                                  Function<DependencyType, List<ObjectType>> getCyclicListDependency,
                                                                  Function<DependencyType, Consumer<List<ObjectType>>> updateDependencyValues
    ) {
        dependencyUpdateService.manyToOne(objectToUpdate, getDependency, getId, getCyclicListDependency, updateDependencyValues)
                .ifPresent(it -> DatabaseManager.getInstance().update(it, clazz));
    }

    /**
     * Updates the database record of a oneToMany relationship
     */
    protected <DependencyType, ObjectType> void oneToMany(ObjectType objectToUpdate,
                                                          Class<DependencyType> clazz,
                                                          Function<ObjectType, List<DependencyType>> getDependency,
                                                          Function<DependencyType, Consumer<ObjectType>> updateDependencyValue
    ) {
        List<DependencyType> values = dependencyUpdateService
                .oneToMany(objectToUpdate, getDependency, updateDependencyValue);
        DatabaseManager.getInstance().updateAll(values, clazz);
    }

    /**
     * Updates the database record of a oneToOne relationship
     */
    protected <DependencyType, ObjectType> void oneToOne(ObjectType objectToUpdate,
                                                         Class<DependencyType> clazz,
                                                         Function<ObjectType, DependencyType> getDependency,
                                                         Function<DependencyType, Consumer<ObjectType>> updateDependencyValue) {
        dependencyUpdateService.oneToOne(objectToUpdate, getDependency, updateDependencyValue)
                .ifPresent(it -> DatabaseManager.getInstance().update(it, clazz));
    }

    /**
     * Updates the database record of a manyToMany relationship
     */
    protected <DependencyType, IdType, ObjectType> void manyToMany(ObjectType objectToUpdate,
                                                                   Class<DependencyType> clazz,
                                                                   Function<ObjectType, List<DependencyType>> getDependency,
                                                                   Function<ObjectType, IdType> getId,
                                                                   Function<DependencyType, List<ObjectType>> getCyclicListDependency,
                                                                   Function<DependencyType, Consumer<List<ObjectType>>> updateDependencyValues
    ) {
        List<DependencyType> dependencyTypes = dependencyUpdateService.manyToMany(objectToUpdate, getDependency, getId, getCyclicListDependency, updateDependencyValues);
        DatabaseManager.getInstance().updateAll(dependencyTypes, clazz);
    }

    /**
     * Updates the database record of a manyToMany relationship
     */
    protected <DependencyType, IdType, ObjectType> void nonOwningManyToMany(ObjectType objectToUpdate,
                                                                            ObjectType previousVersion,
                                                                            Class<DependencyType> clazz,
                                                                            Function<ObjectType, List<DependencyType>> getDependency,
                                                                            Function<ObjectType, IdType> getId,
                                                                            Function<DependencyType, List<ObjectType>> getCyclicListDependency,
                                                                            Function<DependencyType, Consumer<List<ObjectType>>> updateDependencyValues
    ) {
        List<DependencyType> dependencyTypes = dependencyUpdateService.nonOwningManyToMany(
                objectToUpdate,
                previousVersion,
                getDependency,
                getId,
                getCyclicListDependency,
                updateDependencyValues
        );
        DatabaseManager.getInstance().updateAll(dependencyTypes, clazz);
    }

    protected abstract void updateDependencies(JsonNode jsonNode, T object);

    protected void updateDependencies(JsonNode jsonNode, T object, T previous) {
        this.updateDependencies(jsonNode, object);
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
                        + String.join(" | ", stringEntry.getValue()))
                .collect(Collectors.joining(" + "));
    }

    protected String getParameter(Map<String, String[]> paramMap, String key, String defaultValue) {
        return Optional.ofNullable(paramMap.get(key)).map(it -> it[0]).orElse(defaultValue);
    }

    protected String getParameter(Map<String, String[]> paramMap, String key) {
        return getParameter(paramMap, key, null);
    }

    protected List<T> getList(HttpServletRequest request, HttpServletResponse response,
                              BiFunction<Map<String, String[]>, HttpServletResponse, List<T>> itemSupplier,
                              String serializedKey) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method GET called with params " + paramMapToString(parameterMap));
        List<T> items = itemSupplier.apply(parameterMap, response);

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


    protected Page<T> getCsv(HttpServletRequest request,
                             HttpServletResponse response,
                             Map<String, String[]> parameterMap,
                             PagingAndSortingRepository<T> repository) {

        PageRequest pageRequest = UrlParseHelper.readPageRequest(parameterMap, 1000);
        Filter filter = UrlParseHelper.readFilter(parameterMap);
        Sort sort = UrlParseHelper.readSort(parameterMap);
        User requestingUser = AuthenticationService.parseNullableUserFromRequestHeader(request);

        Page<T> resultPage = repository.get(requestingUser, pageRequest, sort, filter);

        String id = getParameter(parameterMap, "id");

        //todo how to differentiate between 404 and 503?
        if (stringIsNotEmpty(id) && resultPage.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return new Page<>();
        }

        if (stringIsNotEmpty(id) && resultPage.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to see this item");
            return new Page<>();
        }

        String csv;
        try {
            csv = new CsvConverter<T>().convertList(resultPage.getContent());
            response.getWriter().append(csv);
        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logger.error("Could not convert result to csv", e);
            return new Page<>();
        }

        return resultPage;
    }

    protected Page<T> getPage(HttpServletRequest request,
                              HttpServletResponse response,
                              Map<String, String[]> parameterMap,
                              PagingAndSortingRepository<T> repository
    ) {

        PageRequest pageRequest = UrlParseHelper.readPageRequest(parameterMap);
        Filter filter = UrlParseHelper.readFilter(parameterMap);
        Sort sort = UrlParseHelper.readSort(parameterMap);
        User requestingUser = AuthenticationService.parseNullableUserFromRequestHeader(request);

        Page<T> resultPage = repository.get(requestingUser, pageRequest, sort, filter);

        String id = getParameter(parameterMap, "id");

        //todo how to differentiate between 404 and 503?
        if (stringIsNotEmpty(id) && resultPage.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return new Page<>();
        }

        if (stringIsNotEmpty(id) && resultPage.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to see this item");
            return new Page<>();
        }

        ApiUtils.getInstance().serializeObject(response, resultPage, null);
        return resultPage;
    }

    protected Page<T> get(HttpServletRequest request,
                          HttpServletResponse response,
                          PagingAndSortingRepository<T> repository) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method GET called with params " + paramMapToString(parameterMap));

        SerializationOption serializationOption = UrlParseHelper.readSerializationOption(parameterMap);
        switch (serializationOption) {
            case PAGE:
                return this.getPage(request, response, parameterMap, repository);
            case CSV:
                return this.getCsv(request, response, parameterMap, repository);
            default:
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                logger.error("Serialization option " + serializationOption.toStringValue() + " not implemented yet");
                return new Page<>();
        }
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

        DatabaseManager.getInstance().save(item, clazz);

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

        T item = DatabaseManager.getInstance().getById(clazz, jsonItem.get(jsonId).asInt());

        //check if user is authorized to modify item
        if (!AuthenticationService.userIsAuthorized(request, authenticationStrategy::isAllowedToModify, item)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            logger.error("User is not logged in or is not allowed to modify this shop item");
            return null;
        }

        T finalItem = item;
        T copy = this.createCopy(item);

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

        item = transform.apply(
                ApiUtils.getInstance().updateFromJson(jsonItem, item, clazz)
        );

        //update cyclic dependencies etc.
        this.updateDependencies(jsonItem, item, copy);

        DatabaseManager.getInstance().update(item, clazz);

        response.setStatus(HttpServletResponse.SC_CREATED);
        ApiUtils.getInstance().serializeObject(response, getSerialized.apply(item), serializedKey);
        return item;
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
                       Class<T> clazz,
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
        DatabaseManager.getInstance().remove(itemToDelete, clazz);
        return itemToDelete;
    }

    protected T delete(Class<T> clazz,
                       HttpServletRequest request,
                       HttpServletResponse response) {

        return this.delete(request, response, clazz, req -> {
            String id = request.getParameter("id");
            return DatabaseManager.getInstance().getById(clazz, Integer.valueOf(id));
        });
    }
}
