package memo.data;

import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.EntryCategory;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class EntryCategoryRepository extends AbstractPagingAndSortingRepository<EntryCategory> {

    public EntryCategoryRepository() {
        super(EntryCategory.class, new ConfigurableAuthStrategy<>(true));
    }

    private EntryCategory build(String name, Integer category, Integer id) {
        EntryCategory entryCategory = new EntryCategory();
        entryCategory.setName(name);
        entryCategory.setCategory(category);
        entryCategory.setId(id);
        return entryCategory;
    }

    @Override
    public Optional<EntryCategory> getById(Integer id) {
        return this.getById("" + id);
    }

    @Override
    public Optional<EntryCategory> getById(String id) {
        return Optional.of(this.get(id))
                .map(categories -> categories.size() > 0 ? categories.get(0) : null);
    }

    @Override
    public List<EntryCategory> get(String id) {
        return this.getAll().stream()
                .filter(entryCategory -> Objects.equals(entryCategory.getId().toString(), id))
                .collect(Collectors.toList());
    }

    public List<EntryCategory> get(String searchTerm, String categoryId) {
        if (categoryId != null) {
            return this.get(categoryId);
        }
        return this.getAll();
    }

    @Override
    public List<EntryCategory> getAll() {
        List<EntryCategory> result = DatabaseManager.createEntityManager()
                .createQuery("SELECT category FROM EntryCategory category", EntryCategory.class)
                .getResultList();

        if (result.isEmpty()) {
            DatabaseManager.getInstance().saveAll(Arrays.asList(
                    this.build("Verpflegung", 1, 1),
                    this.build("Tickets", 1, 2),
                    this.build("Mietkosten", 1, 3),
                    this.build("Steuern", 1, 4),
                    this.build("Sonstiges", 1, 5)
            ), EntryCategory.class);
        }

        return DatabaseManager.createEntityManager()
                .createQuery("SELECT category FROM EntryCategory category", EntryCategory.class)
                .getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<EntryCategory> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest,
                new PredicateSupplierMap<EntryCategory>()
                        .buildPut("searchTerm", PredicateFactory::isTrueSupplier)
                        .buildPut("categoryId", PredicateFactory.getIdSupplier("id"))
        );
    }
}
