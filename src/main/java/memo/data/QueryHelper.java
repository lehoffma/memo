package memo.data;

import memo.auth.api.strategy.AuthenticationStrategy;
import memo.data.util.PredicateFactory;
import memo.model.User;
import memo.util.model.Filter;
import memo.util.model.Sort;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class QueryHelper {
    private static final Pattern belowRegex = Pattern.compile("below([\\d]+)");
    private static final Pattern rangeRegex = Pattern.compile("between([\\d]+)and([\\d]+)");
    private static final Pattern moreThanRegex = Pattern.compile("moreThan([\\d]+)");

    /**
     * @param builder
     * @param root
     * @param filter
     * @param <T>
     * @return
     */
    public static <T> List<Predicate> getPredicatesFromFilter(CriteriaBuilder builder,
                                                              PagingAndSortingRepository<T> repository,
                                                              Root<T> root,
                                                              Filter filter) {
        return filter.getRequests().stream()
                .map(request -> repository.fromFilter(builder, root, request))
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
    }

    /**
     * @param builder
     * @param root
     * @param sort
     * @param <T>
     * @return
     */
    public static <T> List<Order> getOrdersFromSort(CriteriaBuilder builder,
                                                    Root<T> root,
                                                    Sort sort) {
        return sort.getOrders().stream()
                .map(order -> PredicateFactory.get(root, order.getProperty())
                        .map(property -> {
                            switch (order.getDirection()) {
                                //for some reason, desc sorts in ascending and asc in descending order, no idea why though
                                case ASCENDING:
                                    return builder.desc(property);
                                case DESCENDING:
                                    return builder.asc(property);
                                case NONE:
                                    //do nothing
                            }
                            return null;
                        })
                )
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    /**
     * @param builder
     * @param repository
     * @param root
     * @param filter
     * @param <T>
     * @return
     */
    private static <T> Predicate[] getCombinedPredicates(
            CriteriaBuilder builder,
            PagingAndSortingRepository<T> repository,
            AuthenticationStrategy<T> authenticationStrategy,
            User requestingUser,
            Root<T> root,
            Filter filter
    ) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(authenticationStrategy.isAllowedToRead(builder, root, requestingUser));
        predicates.addAll(getPredicatesFromFilter(builder, repository, root, filter));
        return predicates.toArray(new Predicate[]{});
    }

    /**
     * Utilizes the JPA criteria querying API to dynamically extract a filtered and sorted set of entities from the database.
     *
     * @param em     the entitymanager responsible for the query generation
     * @param clazz  the class of the entity we want to query
     * @param sort   the sorting options object containing a list of properties to sort by
     * @param filter the filtering options object containing a list of filter predicates to filter the result with
     * @param <T>    the type of the queried class
     * @return
     */
    public static <T> TypedQuery<T> get(EntityManager em,
                                        PagingAndSortingRepository<T> repository,
                                        Class<T> clazz,
                                        User requestingUser,
                                        Sort sort,
                                        Filter filter) {
        AuthenticationStrategy<T> authenticationStrategy = repository.getAuthenticationStrategy();
        CriteriaBuilder builder = em.getCriteriaBuilder();

        CriteriaQuery<T> q = builder.createQuery(clazz);
        Root<T> root = q.from(clazz);
        CriteriaQuery<T> finishedQuery = q.select(root)
                .distinct(true)
                .where(getCombinedPredicates(builder, repository, authenticationStrategy, requestingUser, root, filter))
                .orderBy(getOrdersFromSort(builder, root, sort));

        return em.createQuery(finishedQuery);
    }

    /**
     * @param em
     * @param repository
     * @param clazz
     * @param sort
     * @param filter
     * @param <T>
     * @return
     */
    public static <T> TypedQuery<Long> getCountQuery(EntityManager em,
                                                     PagingAndSortingRepository<T> repository,
                                                     Class<T> clazz,
                                                     User requestingUser,
                                                     Sort sort,
                                                     Filter filter) {
        AuthenticationStrategy<T> authenticationStrategy = repository.getAuthenticationStrategy();
        CriteriaBuilder builder = em.getCriteriaBuilder();

        CriteriaQuery<Long> q = builder.createQuery(Long.class);
        Root<T> root = q.from(clazz);
        //todo select count(*) from (select distinct * from ....)

        CriteriaQuery<Long> finishedQuery = q.select(builder.countDistinct(root))
                .where(getCombinedPredicates(builder, repository, authenticationStrategy, requestingUser, root, filter))
                .orderBy(getOrdersFromSort(builder, root, sort));

        return em.createQuery(finishedQuery);
    }

}
