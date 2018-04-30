package memo.data.util;

import memo.util.model.Filter;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


public class PredicateFactory {


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

    public static Predicate combineByOr(CriteriaBuilder builder,
                                        Predicate... predicates) {
        return combineByOr(builder, Arrays.asList(predicates));
    }


    public static <T> PredicateSupplier<T> getSupplier(String key) {
        return getSupplier(root -> root.get(key), Function.identity());
    }

    public static <T> PredicateSupplier<T> getIdSupplier(String key) {
        return getSupplier(root -> root.get(key), Integer::valueOf);
    }

    public static <T> PredicateSupplier<T> getIdSupplier(Function<Root<T>, Path<Object>> getValue) {
        return getSupplier(getValue, Integer::valueOf);
    }

    public static <T, U> PredicateSupplier<T> getSupplier(
            Function<Root<T>, Path<Object>> getValue
    ) {
        return getSupplier(getValue, Function.identity());
    }

    public static <T, U> PredicateSupplier<T> getSupplier(
            Function<Root<T>, Path<Object>> getValue,
            Function<String, U> transformRequestValue
    ) {
        return (builder, root, filterRequest) -> {
            Predicate matchesAnyId = combineByOr(builder, filterRequest.getValues().stream()
                    .map(value -> builder.equal(getValue.apply(root), transformRequestValue.apply(value)))
                    .collect(Collectors.toList())
            );
            return Collections.singletonList(matchesAnyId);
        };
    }

    /**
     * Combines a list of filter values into an OR-ed predicate
     *
     * @param builder
     * @param root
     * @param filterRequest
     * @return
     */
    public static <T> List<Predicate> getByKey(CriteriaBuilder builder,
                                               Root<T> root,
                                               Filter.FilterRequest filterRequest) {
        List<Predicate> predicates = filterRequest.getValues().stream()
                .map(value -> builder.equal(root.get(filterRequest.getKey()), value))
                .collect(Collectors.toList());
        Predicate combinedPredicate = combineByOr(builder, predicates);

        return Arrays.asList(combinedPredicate);
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
                                               Function<Root<T>, Path<Integer>> getId,
                                               Integer... ids) {
        List<Predicate> predicates = Arrays.stream(ids)
                .map(value -> builder.equal(getId.apply(root), value))
                .collect(Collectors.toList());
        Predicate combinedPredicate = combineByOr(builder, predicates);

        return Collections.singletonList(combinedPredicate);
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
        List<Predicate> predicates = filterRequest.getValues().stream()
                .map(value -> builder.equal(root.get(filterRequest.getKey()), Integer.valueOf(value)))
                .collect(Collectors.toList());
        Predicate combinedPredicate = combineByOr(builder, predicates);

        return Arrays.asList(combinedPredicate);
    }

    public static <T> List<Predicate> fromFilter(CriteriaBuilder builder,
                                                 Root<T> root,
                                                 Filter.FilterRequest filterRequest) {
        return fromFilter(builder, root, filterRequest, new HashMap<>());
    }

    public static <T> List<Predicate> fromFilter(CriteriaBuilder builder,
                                                 Root<T> root,
                                                 Filter.FilterRequest filterRequest,
                                                 Map<String, PredicateSupplier<T>> additionalFilterValues) {
        String key = filterRequest.getKey();

        Optional<Map.Entry<String, PredicateSupplier<T>>> match = additionalFilterValues.entrySet().stream()
                .filter(entry -> key.equalsIgnoreCase(entry.getKey()))
                .findAny();

        if (match.isPresent()) {
            Map.Entry<String, PredicateSupplier<T>> entry = match.get();
            PredicateSupplier<T> predicateSupplier = entry.getValue();
            return predicateSupplier.get(builder, root, filterRequest);
        }

        if (key.equalsIgnoreCase("id")) {
            return getByIds(builder, root, filterRequest);
        }
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
        List<Predicate> isLikePredicates = filterRequest.getValues().stream()
                .map(value -> keysToSearch.stream()
                        .map(it -> builder.upper(root.get(it)))
                        .map(it -> builder.like(it, "%" + value + "%"))
                        .collect(Collectors.toList())
                )
                .flatMap(Collection::stream)
                .collect(Collectors.toList());

        return Collections.singletonList(combineByOr(builder, isLikePredicates));
    }

    private static LocalDateTime isoToDate(String isoDate) {
        TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                .parse(isoDate);
        return LocalDateTime.from(minDateTemporalAccessor);
    }

    public static <T> List<Predicate> minDate(CriteriaBuilder builder,
                                              Root<T> root,
                                              Filter.FilterRequest filterRequest,
                                              Function<Root<T>, Path<Timestamp>> getDate
    ) {
        List<Predicate> minDatePredicates = filterRequest.getValues().stream()
                .map(PredicateFactory::isoToDate)
                .map(date -> builder.greaterThanOrEqualTo(
                        getDate.apply(root),
                        Timestamp.valueOf(date)
                ))
                .collect(Collectors.toList());

        Predicate dateMatchesAnyOfThePredicates = combineByOr(builder, minDatePredicates);
        return Collections.singletonList(dateMatchesAnyOfThePredicates);
    }


    public static <T> List<Predicate> maxDate(CriteriaBuilder builder,
                                              Root<T> root,
                                              Filter.FilterRequest filterRequest,
                                              Function<Root<T>, Path<Timestamp>> getDate
    ) {
        List<Predicate> minDatePredicates = filterRequest.getValues().stream()
                .map(PredicateFactory::isoToDate)
                .map(date -> builder.lessThanOrEqualTo(
                        getDate.apply(root),
                        Timestamp.valueOf(date)
                ))
                .collect(Collectors.toList());

        Predicate dateMatchesAnyOfThePredicates = combineByOr(builder, minDatePredicates);
        return Collections.singletonList(dateMatchesAnyOfThePredicates);
    }
}
