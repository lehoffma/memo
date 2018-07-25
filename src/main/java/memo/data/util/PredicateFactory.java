package memo.data.util;

import memo.util.model.Filter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.persistence.criteria.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;


public class PredicateFactory {
    private static final Logger logger = LogManager.getLogger(PredicateFactory.class);

    @FunctionalInterface
    public interface PredicateSupplier<T> {
        List<Predicate> get(CriteriaBuilder builder,
                            Root<T> root,
                            Filter.FilterRequest filterRequest
        );
    }

    /**
     * source: https://stackoverflow.com/questions/14675229/jpa-criteria-api-how-to-express-literal-true-and-literal-false
     * this predicate will always return true
     *
     * @param builder
     * @return
     */
    public static Predicate isTrue(CriteriaBuilder builder) {
        return builder.and();
    }

    public static <T> List<Predicate> isTrueSupplier(CriteriaBuilder builder,
                                                     Root<T> root,
                                                     Filter.FilterRequest filterRequest) {
        return Arrays.asList(isTrue(builder));
    }

    /**
     * source: https://stackoverflow.com/questions/14675229/jpa-criteria-api-how-to-express-literal-true-and-literal-false
     * this predicate will always return false
     *
     * @param builder
     * @return
     */
    public static Predicate isFalse(CriteriaBuilder builder) {
        return builder.or();
    }

    public static <T> List<Predicate> isFalseSupplier(CriteriaBuilder builder,
                                                      Root<T> root,
                                                      Filter.FilterRequest filterRequest) {
        return Arrays.asList(isFalse(builder));
    }


    public static Predicate condition(CriteriaBuilder builder, Boolean condition) {
        return condition
                ? PredicateFactory.isTrue(builder)
                : PredicateFactory.isFalse(builder);
    }

    public static <T> Predicate condition(CriteriaBuilder builder, java.util.function.Predicate<T> condition, T value) {
        return condition(builder, condition.test(value));
    }

    public static <T, U> Optional<Path<U>> get(CriteriaBuilder builder, Class<T> clazz,
                                               String... properties) {
        CriteriaQuery<T> q = builder.createQuery(clazz);
        Root<T> root = q.from(clazz);
        return get(root, properties);
    }

    public static <T, U> Optional<Path<U>> get(Path<T> root, Function<Path<T>, Path<U>> get) {
        return getOptional(root, get.andThen(Optional::ofNullable));
    }

    public static <T, U> Optional<Path<U>> getOptional(Path<T> root, Function<Path<T>, Optional<Path<U>>> get) {
        try {
            return get.apply(root);
        } catch (IllegalArgumentException e) {
            logger.error("Could not get property of " + root.getJavaType().getName(), e);
            return Optional.empty();
        }
    }

    public static <T, U> Optional<Path<U>> get(Path<T> root, String... properties) {
        Path object = root;
        for (String property : properties) {
            try {
                object = object.get(property);
            } catch (IllegalArgumentException | IllegalStateException e) {
                logger.error("Could not get property '" + property + "' of " + root.getJavaType().getName(), e);
                return Optional.empty();
            }
        }
        return Optional.ofNullable((Path<U>) object);
    }


    /**
     * @param builder
     * @param predicates
     * @return
     */
    public static Predicate combineByOr(CriteriaBuilder builder,
                                        List<Predicate> predicates) {
        return predicates.stream()
                .reduce(builder::or)
                .orElse(isTrue(builder));
    }

    public static <T, U, V> Predicate isEqualToSome(CriteriaBuilder builder,
                                                    Path<T> path,
                                                    List<String> values,
                                                    Function<String, U> transformRequestValue,
                                                    Function<Path<T>, Optional<Path<V>>> getValue
    ) {
        return combineByOr(builder, values.stream()
                .map(value -> getOptional(path, getValue)
                        .map(valuePath -> builder.equal(valuePath, transformRequestValue.apply(value))))
                //transform ill-formed functions into false
                //e.g. someone requests all entries of a certain event type
                // and the getEventType implementation is buggy, for example:
                //      root.get("item").get("typo")
                .map(it -> it.orElse(PredicateFactory.isFalse(builder)))
                .collect(Collectors.toList())
        );
    }

    public static <T, U, V> Predicate isEqualToSome(CriteriaBuilder builder,
                                                    Path<T> path,
                                                    Filter.FilterRequest filterRequest,
                                                    Function<String, U> transformRequestValue,
                                                    Function<Path<T>, Optional<Path<V>>> getValue
    ) {
        return isEqualToSome(builder, path, filterRequest.getValues(), transformRequestValue, getValue);
    }

    public static <T, U, V> Predicate isEqualToSome(CriteriaBuilder builder,
                                                    Path<T> path,
                                                    Filter.FilterRequest filterRequest,
                                                    Function<String, U> transformRequestValue,
                                                    String... properties
    ) {
        return isEqualToSome(builder, path, filterRequest.getValues(), transformRequestValue,
                pathObject -> PredicateFactory.get(pathObject, properties)
        );
    }

    public static <T> PredicateSupplier<T> getIdSupplier(String key) {
        return getSupplier(root -> get(root, key), Integer::valueOf);
    }

    public static <T, U> PredicateSupplier<T> getIdSupplier(String... properties) {
        return getSupplier(tPath -> PredicateFactory.get(tPath, properties), Integer::valueOf);
    }

    public static <T, U> PredicateSupplier<T> getIdSupplier(Function<Path<T>, Optional<Path<U>>> getValue) {
        return getSupplier(getValue, Integer::valueOf);
    }

    public static <T, U> PredicateSupplier<T> getSupplier(
            Function<Path<T>, Optional<Path<U>>> getValue
    ) {
        return getSupplier(getValue, Function.identity());
    }

    public static <T, U> PredicateSupplier<T> getSupplier(String... properties) {
        return getSupplier(tPath -> PredicateFactory.get(tPath, properties));
    }

    public static <T, U, V> PredicateSupplier<T> getSupplier(
            Function<Path<T>, Optional<Path<V>>> getValue,
            Function<String, U> transformRequestValue
    ) {
        return (builder, root, filterRequest) -> Arrays.asList(
                isEqualToSome(builder, root, filterRequest, transformRequestValue, getValue)
        );
    }

    public static <T, U, V> PredicateSupplier<T> getOptionalSupplier(
            Function<Path<T>, Optional<Path<V>>> getValue,
            Function<String, Optional<U>> transformRequestValue
    ) {
        return (builder, root, filterRequest) -> Arrays.asList(
                isEqualToSome(builder, root, filterRequest, transformRequestValue, getValue)
        );
    }

    /**
     * @param builder
     * @param root
     * @param filterRequest
     * @return
     */
    public static <T> List<Predicate> getByKey(CriteriaBuilder builder,
                                               Root<T> root,
                                               Filter.FilterRequest filterRequest) {
        return Arrays.asList(
                isEqualToSome(builder, root, filterRequest,
                        Function.identity(),
                        filterRequest.getKey()
                )
        );
    }

    /**
     * Combines a list of filter values into an OR-ed predicate
     *
     * @param builder
     * @param root
     * @return
     */
    public static <T> List<Predicate> getByIds(CriteriaBuilder builder,
                                               Root<T> root,
                                               Function<Path<T>, Optional<Path<Integer>>> getId,
                                               Integer... ids) {
        List<String> idList = Arrays.stream(ids)
                .map(Object::toString)
                .collect(Collectors.toList());

        return Collections.singletonList(
                PredicateFactory.isEqualToSome(builder, root, idList, Function.identity(), getId)
        );
    }

    /**
     * Combines a list of filter values into an OR-ed predicate
     *
     * @param builder
     * @param root
     * @param filterRequest
     * @return
     */
    public static <T> List<Predicate> getByIds(CriteriaBuilder builder,
                                               Root<T> root,
                                               Filter.FilterRequest filterRequest) {
        return Collections.singletonList(
                isEqualToSome(builder, root, filterRequest,
                        Integer::valueOf,
                        filterRequest.getKey()
                )
        );
    }

    /**
     * @param boundedKey
     * @return
     */
    private static String getRootKeyFromBoundedKey(String boundedKey) {
        if (!PredicateFactory.isMinOrMaxParameter(boundedKey)) {
            return boundedKey;
        }

        String rootKey = boundedKey.substring(3);

        //lowercase the first letter (to transform something like "minDate" to "date")
        char c[] = rootKey.toCharArray();
        c[0] = Character.toLowerCase(c[0]);
        rootKey = new String(c);

        return rootKey;
    }

    /**
     * Constructs a min or max query from the given FilterRequest object
     *
     * @param builder
     * @param root
     * @param filterRequest
     * @param <T>
     * @return
     */
    public static <T, U extends Comparable<? super U>> List<Predicate> getBounded(CriteriaBuilder builder, Root<T> root,
                                                                                  Filter.FilterRequest filterRequest,
                                                                                  Function<String, U> transform) {
        String key = filterRequest.getKey();
        String rootKey = PredicateFactory.getRootKeyFromBoundedKey(key);
        if (key.startsWith("min")) {
            return Collections.singletonList(
                    min(builder, root, filterRequest, transform, it -> get(it, rootKey))
            );
        }
        if (key.startsWith("max")) {
            return Collections.singletonList(
                    max(builder, root, filterRequest, transform, it -> get(it, rootKey))
            );
        }
        return new ArrayList<>();
    }

    private static Function getTransform(String requestKey) {
        String key = requestKey.toLowerCase();
        if (key.contains("date") || key.contains("timestamp")) {
            return s -> PredicateFactory.isoToTimestamp((String) s);
        }
        return s -> s;
    }

    public static <T> List<Predicate> fromFilter(CriteriaBuilder builder,
                                                 Root<T> root,
                                                 Filter.FilterRequest filterRequest) {
        return fromFilter(builder, root, filterRequest, new HashMap<>());
    }


    private static boolean isMinOrMaxParameter(String parameterKey) {
        return parameterKey.length() > 3 && (parameterKey.startsWith("min") || parameterKey.startsWith("max"));
    }


    public static <T, U extends Comparable<? super U>> List<Predicate> fromFilter(CriteriaBuilder builder,
                                                                                  Root<T> root,
                                                                                  Filter.FilterRequest filterRequest,
                                                                                  Map<String, PredicateSupplier<T>> additionalFilterValues) {
        String key = filterRequest.getKey();

        //first try finding a match in the supplied additionalValues map
        Optional<Map.Entry<String, PredicateSupplier<T>>> match = additionalFilterValues.entrySet().stream()
                .filter(entry -> key.equalsIgnoreCase(entry.getKey()))
                .findAny();

        if (match.isPresent()) {
            Map.Entry<String, PredicateSupplier<T>> entry = match.get();
            PredicateSupplier<T> predicateSupplier = entry.getValue();
            return predicateSupplier.get(builder, root, filterRequest);
        }

        //if nothing matched, check if the filterRequest is something like minX or maxX
        if (isMinOrMaxParameter(key)) {
            Function<String, U> transform = (Function<String, U>) getTransform(filterRequest.getKey());
            return getBounded(builder, root, filterRequest, transform);
        }

        //if that didn't match either, check for id queries
//        if (key.equalsIgnoreCase("id")) {
//            return getByIds(builder, root, filterRequest);
//        }

        //otherwise, just compare the value of the key directly
        return getByKey(builder, root, filterRequest);
    }


    /**
     * Constructs a list of OR-ed predicates that checks if any of the values of the given keys match the one
     * in the filterRequest (via 'LIKE %<value>%')
     *
     * @param builder
     * @param root
     * @param filterRequest
     * @param keysToSearch
     * @param <T>
     * @return
     */
    public static <T> List<Predicate> search(CriteriaBuilder builder,
                                             Root<T> root,
                                             Filter.FilterRequest filterRequest,
                                             List<String> keysToSearch
    ) {
        //separate request value by \s and search every key separately
        //every value has to match something though

        //all values have to match something

        List<Predicate> isLikePredicates = filterRequest.getValues().stream()
                .flatMap(value -> Arrays.stream(value.split("\\s")))
                .map(value -> keysToSearch.stream()
                        .map(it -> PredicateFactory.<T, String>get(root, it)
                                .map(builder::upper)
                                .map(upper -> builder.like(upper, "%" + value.trim() + "%"))
                                .orElse(PredicateFactory.isFalse(builder))
                        )
                        .reduce(builder::or)
                        .orElse(isTrue(builder))
                )
                .collect(Collectors.toList());


        return Collections.singletonList(isLikePredicates.stream()
                .reduce(builder::and)
                .orElse(isFalse(builder)));
    }

    private static LocalDateTime isoToDate(String isoDate) {
        TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                .parse(isoDate);
        return LocalDateTime.from(minDateTemporalAccessor);
    }

    private static Timestamp isoToTimestamp(String isoDate) {
        LocalDateTime localDateTime = isoToDate(isoDate);
        return Timestamp.valueOf(localDateTime);
    }

    /**
     * @param builder
     * @param root
     * @param filterRequest
     * @param getPredicate
     * @param transform
     * @param getValue
     * @param <T>
     * @param <U>
     * @return
     */
    public static <T, U extends Comparable<? super U>> Predicate compare(CriteriaBuilder builder, Root<T> root,
                                                                         Filter.FilterRequest filterRequest,
                                                                         BiFunction<Expression<? extends U>, U, Predicate> getPredicate,
                                                                         Function<String, U> transform,
                                                                         Function<Root<T>, Optional<Path<U>>> getValue
    ) {
        return combineByOr(
                builder,
                filterRequest.getValues().stream()
                        .map(transform)
                        .map(value -> getValue.apply(root)
                                .map(path -> getPredicate.apply(path, value))
                                .orElse(PredicateFactory.isFalse(builder)))
                        .collect(Collectors.toList())
        );
    }

    public static <T, U extends Comparable<? super U>> Predicate min(CriteriaBuilder builder, Root<T> root,
                                                                     Filter.FilterRequest filterRequest,
                                                                     Function<String, U> transform,
                                                                     Function<Root<T>, Optional<Path<U>>> getValue) {
        return compare(builder, root, filterRequest, builder::greaterThanOrEqualTo, transform, getValue);
    }

    public static <T, U extends Comparable<? super U>> Predicate max(CriteriaBuilder builder, Root<T> root,
                                                                     Filter.FilterRequest filterRequest,
                                                                     Function<String, U> transform,
                                                                     Function<Root<T>, Optional<Path<U>>> getValue) {
        return compare(builder, root, filterRequest, builder::lessThanOrEqualTo, transform, getValue);
    }

    public static <T> List<Predicate> minDate(CriteriaBuilder builder,
                                              Root<T> root,
                                              Filter.FilterRequest filterRequest,
                                              Function<Root<T>, Optional<Path<Timestamp>>> getDate
    ) {
        return Collections.singletonList(
                min(builder, root, filterRequest, PredicateFactory::isoToTimestamp, getDate)
        );
    }


    public static <T> List<Predicate> maxDate(CriteriaBuilder builder,
                                              Root<T> root,
                                              Filter.FilterRequest filterRequest,
                                              Function<Root<T>, Optional<Path<Timestamp>>> getDate
    ) {
        return Collections.singletonList(
                max(builder, root, filterRequest, PredicateFactory::isoToTimestamp, getDate)
        );
    }


    public static <T, U> Predicate isMember(CriteriaBuilder builder, Root<T> root,
                                            Function<Path<T>, Optional<Path<List<U>>>> getList,
                                            U value) {

        return anyIsMember(builder, root, getList, Collections.singletonList(value));
    }

    public static <T, U> Predicate anyIsMember(CriteriaBuilder builder, Root<T> root,
                                               Function<Path<T>, Optional<Path<List<U>>>> getList,
                                               List<U> values) {

        return anyIsMember(builder, root, getList, values, Function.<U>identity().andThen(Optional::ofNullable));
    }


    public static <T, U, V> Predicate anyIsMember(CriteriaBuilder builder, Root<T> root,
                                                  Function<Path<T>, Optional<Path<List<V>>>> getList,
                                                  List<U> values,
                                                  Function<U, Optional<V>> transform) {

        return getList.apply(root)
                .map(listPath ->
                        combineByOr(
                                builder,
                                values.stream()
                                        .map(transform)
                                        .filter(Optional::isPresent)
                                        .map(Optional::get)
                                        .map(value -> builder.isMember(value, listPath))
                                        .collect(Collectors.toList())
                        )
                )
                .orElse(PredicateFactory.isFalse(builder));
    }
}
