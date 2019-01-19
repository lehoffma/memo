package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.*;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.AuthenticationStrategy;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.communication.strategy.BaseNotificationStrategy;
import memo.communication.strategy.NotificationStrategy;
import memo.data.PagingAndSortingRepository;
import memo.data.model.SerializationOption;
import memo.data.util.CsvConverter;
import memo.model.User;
import memo.util.DatabaseManager;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import memo.util.model.Page;
import memo.util.model.PageRequest;
import memo.util.model.Sort;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiPredicate;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static memo.util.JsonHelper.stringIsNotEmpty;

public abstract class AbstractApiServlet<T> {
    protected AuthenticationStrategy<T> authenticationStrategy;
    protected NotificationStrategy<T> notificationStrategy;
    protected AuthenticationService authenticationService;
    protected Logger logger = LogManager.getLogger(AbstractApiServlet.class);
    private DependencyUpdateService dependencyUpdateService;


    public AbstractApiServlet() {
        super();
        this.authenticationStrategy = new ConfigurableAuthStrategy<>(true);
        this.notificationStrategy = new BaseNotificationStrategy<>();
        this.dependencyUpdateService = new DependencyUpdateService();
    }


    public AbstractApiServlet(AuthenticationStrategy<T> authenticationStrategy) {
        super();
        this.authenticationStrategy = authenticationStrategy;
        this.notificationStrategy = new BaseNotificationStrategy<>();
        this.dependencyUpdateService = new DependencyUpdateService();
    }

    public AbstractApiServlet(AuthenticationStrategy<T> authenticationStrategy,
                              NotificationStrategy<T> notificationStrategy) {
        super();
        this.authenticationStrategy = authenticationStrategy;
        this.notificationStrategy = notificationStrategy;
        this.dependencyUpdateService = new DependencyUpdateService();
    }

    @FunctionalInterface
    interface DependencyUpdater<T> {
        void updateDependencies(JsonNode jsonNode, T object);
    }

    @FunctionalInterface
    interface DependencyModifier<T> {
        void updateDependencies(JsonNode jsonNode, T object, T previous);
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

    protected <U> Map<String, U> buildMap(String serializedKey, U data) {
        return new MapBuilder<String, U>()
                .buildPut(serializedKey, data);
    }


    private <U> List<U> checkAuthorizationOfList(HttpServletRequest request, List<U> items,
                                                 AuthenticationStrategy<U> authenticationStrategy,
                                                 String id) {
        if (stringIsNotEmpty(id) && items.isEmpty()) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        //remove items from the result the user is not allowed to see
        items = authenticationService.filterUnauthorized(
                items,
                authenticationStrategy::isAllowedToRead,
                request
        );

        if (stringIsNotEmpty(id) && items.isEmpty()) {
            logger.error("User is not logged in or is not allowed to see this item");
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        return items;
    }

    protected <U> U getById(HttpServletRequest request,
                            Function<String, U> itemSupplier,
                            AuthenticationStrategy<U> authenticationStrategy,
                            String id) {
        logger.debug("Method GET called with params " + paramMapToString(request.getParameterMap()));
        List<U> items = Stream.of(itemSupplier.apply(id))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        items = checkAuthorizationOfList(request, items, authenticationStrategy, id);

        return items.get(0);
    }


    protected List<T> getList(HttpServletRequest request,
                              Supplier<List<T>> itemSupplier,
                              String id) {
        logger.debug("Method GET called with params " + paramMapToString(request.getParameterMap()));
        List<T> items = itemSupplier.get();

        return checkAuthorizationOfList(request, items, authenticationStrategy, id);
    }


    protected String getCsv(PageRequest pageRequest,
                            Filter filter,
                            Sort sort,
                            User requestingUser,
                            PagingAndSortingRepository<T> repository,
                            String id) {
        Page<T> resultPage = this.getPage(pageRequest, filter, sort, requestingUser, repository, id);

        try {
            return new CsvConverter<T>().convertList(resultPage.getContent());
        } catch (IOException e) {
            logger.error("Could not convert result to csv", e);
            throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    protected Page<T> getPage(PageRequest pageRequest,
                              Filter filter,
                              Sort sort,
                              User requestingUser,
                              PagingAndSortingRepository<T> repository,
                              String id
    ) {
        Page<T> resultPage = repository.get(requestingUser, pageRequest, sort, filter);

        //todo how to differentiate between 404 and 503?
        if (stringIsNotEmpty(id) && resultPage.isEmpty()) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        if (stringIsNotEmpty(id) && resultPage.isEmpty()) {
            logger.error("User is not logged in or is not allowed to see this item");
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        return resultPage;
    }

    protected Object get(HttpServletRequest request,
                         PagingAndSortingRepository<T> repository) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        logger.debug("Method GET called with params " + paramMapToString(parameterMap));

        //parse options from parameter map and auth header
        SerializationOption serializationOption = UrlParseHelper.readSerializationOption(parameterMap);
        PageRequest pageRequest = UrlParseHelper.readPageRequest(parameterMap);
        Filter filter = UrlParseHelper.readFilter(parameterMap);
        Sort sort = UrlParseHelper.readSort(parameterMap);
        User requestingUser = authenticationService.parseNullableUserFromRequestHeader(request);
        String id = getParameter(parameterMap, "id");

        switch (serializationOption) {
            case PAGE:
                return this.getPage(
                        pageRequest,
                        filter,
                        sort,
                        requestingUser,
                        repository,
                        id
                );
            case CSV:
                return this.getCsv(
                        pageRequest,
                        filter,
                        sort,
                        requestingUser,
                        repository,
                        id
                );
            default:
                logger.error("Serialization option " + serializationOption.toStringValue() + " not implemented yet");
                throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }
    }


    protected <U> U post(HttpServletRequest request,
                         String body,
                         String objectName,
                         U baseValue,
                         Class<U> clazz,
                         Function<U, U> transform,
                         Function<U, List<ModifyPrecondition<U>>> preconditionsSupplier,
                         BiPredicate<User, U> isAllowed,
                         DependencyUpdater<U> dependencyUpdater,
                         NotificationStrategy<U> notificationStrategy
    ) {
        JsonNode jsonItem = JsonHelper.getJsonObject(body, objectName);
        logger.debug("Method POST called with params " + paramMapToString(request.getParameterMap()));

        //perform transformations on the parsed item, i.e. hashing
        U item = transform.apply(
                JsonHelper.updateFromJson(jsonItem, baseValue, clazz)
        );


        //check if user is authorized to create item
        authenticationService.checkUserAuthorization(request, isAllowed, item, logger);

        //check if any of the preconditions failed (i.e. the email is already taken or something)
        checkConditions(preconditionsSupplier.apply(item), item);

        DatabaseManager.getInstance().save(item, clazz);

        //update cyclic dependencies etc.
        dependencyUpdater.updateDependencies(jsonItem, item);
        //send notifications if defined
        notificationStrategy.post(item);

        return item;
    }

    protected <U> U post(HttpServletRequest request,
                         String body,
                         String objectName,
                         U baseValue,
                         Class<U> clazz,
                         Function<U, U> transform,
                         List<ModifyPrecondition<U>> preconditions,
                         BiPredicate<User, U> isAllowed,
                         DependencyUpdater<U> dependencyUpdater,
                         NotificationStrategy<U> notificationStrategy
    ) {
        return post(request, body, objectName, baseValue, clazz, transform, item -> preconditions, isAllowed, dependencyUpdater, notificationStrategy);
    }

    protected T post(HttpServletRequest request,
                     String body,
                     String objectName,
                     T baseValue,
                     Class<T> clazz,
                     Function<T, T> transform,
                     List<ModifyPrecondition<T>> preconditions
    ) {
        return post(
                request, body, objectName, baseValue, clazz, transform, preconditions,
                authenticationStrategy::isAllowedToCreate, this::updateDependencies, this.notificationStrategy
        );
    }

    protected <SerializedType> T post(HttpServletRequest request,
                                      String body,
                                      ApiServletPostOptions<T, SerializedType> options) {
        return this.post(request, body,
                options.getObjectName(),
                options.getBaseValue(),
                options.getClazz(),
                options.getTransform(),
                options.getPreconditions()
        );
    }

    protected <U, SerializedType> Response respond(U createdItem,
                                                   String serializedKey,
                                                   Function<U, SerializedType> getSerialized) {
        return Response.status(Response.Status.CREATED)
                .entity(buildMap(serializedKey, getSerialized.apply(createdItem)))
                .build();
    }


    protected <U> U put(HttpServletRequest request,
                        String body,
                        String objectName,
                        String jsonId,
                        Class<U> clazz,
                        Function<U, U> transform,
                        Function<U, List<ModifyPrecondition<U>>> preconditionsSupplier,
                        BiPredicate<User, U> isAllowed,
                        Function<U, U> createCopy,
                        DependencyModifier<U> dependencyUpdater,
                        NotificationStrategy<U> notificationStrategy) {

        logger.debug("Method PUT called with params " + paramMapToString(request.getParameterMap()));
        JsonNode jsonItem = JsonHelper.getJsonObject(body, objectName);

        if (!jsonItem.has(jsonId)) {
            throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }

        U item = DatabaseManager.getInstance().getById(clazz, jsonItem.get(jsonId).asInt());

        if (item == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        authenticationService.checkUserAuthorization(request, isAllowed, item, logger);

        U copy = createCopy.apply(item);

        //check if any of the preconditions failed (i.e. the email is already taken or something)
        checkConditions(preconditionsSupplier.apply(item), item);


        item = transform.apply(
                JsonHelper.updateFromJson(jsonItem, item, clazz)
        );

        //update cyclic dependencies etc.
        dependencyUpdater.updateDependencies(jsonItem, item, copy);

        DatabaseManager.getInstance().update(item, clazz);

        //send notifications if defined
        notificationStrategy.put(item);

        return item;
    }

    protected <U> U put(HttpServletRequest request,
                        String body,
                        String objectName,
                        String jsonId,
                        Class<U> clazz,
                        Function<U, U> transform,
                        List<ModifyPrecondition<U>> preconditions,
                        BiPredicate<User, U> isAllowed,
                        Function<U, U> createCopy,
                        DependencyModifier<U> dependencyUpdater,
                        NotificationStrategy<U> notificationStrategy) {
        return put(request, body, objectName, jsonId, clazz, transform, (item) -> preconditions, isAllowed, createCopy, dependencyUpdater, notificationStrategy);
    }

    protected T put(HttpServletRequest request,
                    String body,
                    String objectName,
                    String jsonId,
                    Class<T> clazz,
                    Function<T, T> transform,
                    List<ModifyPrecondition<T>> preconditions) {
        return put(request, body, objectName, jsonId, clazz, transform, preconditions,
                authenticationStrategy::isAllowedToModify, this::createCopy, this::updateDependencies,
                notificationStrategy);
    }

    protected <U> void checkConditions(List<ModifyPrecondition<U>> preconditions, U item) {
        Optional<ModifyPrecondition<U>> failedCondition = preconditions.stream()
                .filter(it -> it.getPredicate().test(item)).findFirst();

        handleFailedCondition(failedCondition);
    }

    @SuppressWarnings("OptionalUsedAsFieldOrParameterType")
    protected <U> boolean handleFailedCondition(Optional<ModifyPrecondition<U>> failedCondition) {
        if (failedCondition.isPresent()) {
            ModifyPrecondition<U> condition = failedCondition.get();
            logger.error(condition.getErrorMessage());
            condition.getConsequence().run();
            return true;
        }
        return false;
    }

    protected <SerializedType> T put(HttpServletRequest request, String body,
                                     ApiServletPutOptions<T, SerializedType> options) {
        return this.put(request, body,
                options.getObjectName(),
                options.getJsonId(),
                options.getClazz(),
                options.getTransform(),
                options.getPreconditions()
        );
    }


    protected <U> U delete(HttpServletRequest request,
                           Class<U> clazz,
                           Function<HttpServletRequest, U> itemSupplier,
                           NotificationStrategy<U> notificationStrategy,
                           AuthenticationStrategy<U> authenticationStrategy
    ) {
        logger.debug("Method DELETE called with params " + paramMapToString(request.getParameterMap()));

        U itemToDelete = itemSupplier.apply(request);

        User user = authenticationService.parseNullableUserFromRequestHeader(request);
        boolean isAuthorized = authenticationStrategy.isAllowedToDelete(user, itemToDelete);

        if (!isAuthorized) {
            logger.error("User is not logged in or is not allowed to modify this shop item");
            throw new WebApplicationException(Response.Status.FORBIDDEN);
        }

        if (itemToDelete == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        logger.debug("Object: " + itemToDelete.toString() + " will be removed");
        DatabaseManager.getInstance().remove(itemToDelete, clazz);

        notificationStrategy.delete(itemToDelete);
        return itemToDelete;
    }

    protected T delete(HttpServletRequest request,
                       Class<T> clazz,
                       Function<HttpServletRequest, T> itemSupplier
    ) {
        return delete(request, clazz, itemSupplier, notificationStrategy, authenticationStrategy);
    }

    protected T delete(Class<T> clazz,
                       HttpServletRequest request) {

        return this.delete(request, clazz, req -> {
            String id = request.getParameter("id");
            return DatabaseManager.getInstance().getById(clazz, Integer.valueOf(id));
        });
    }

    public AbstractApiServlet<T> setAuthenticationStrategy(AuthenticationStrategy<T> authenticationStrategy) {
        this.authenticationStrategy = authenticationStrategy;
        return this;
    }

    public AbstractApiServlet<T> setNotificationStrategy(NotificationStrategy<T> notificationStrategy) {
        this.notificationStrategy = notificationStrategy;
        return this;
    }
}
