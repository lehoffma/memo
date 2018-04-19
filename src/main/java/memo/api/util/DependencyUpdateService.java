package memo.api.util;

import org.eclipse.persistence.indirection.IndirectList;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;

public class DependencyUpdateService {

    private <T> List<T> convertFromIndirectList(List<T> list) {
        return list instanceof IndirectList ? new ArrayList<>(list) : list;
    }

    private <T, DependencyType, IdType> List<T> getUpdatedValues(
            T objectToUpdate,
            DependencyType dependency,
            Function<T, IdType> getId,
            Function<DependencyType, List<T>> getCyclicListDependency
    ) {
        IdType id = getId.apply(objectToUpdate);
        List<T> currentValues = Optional.ofNullable(convertFromIndirectList(getCyclicListDependency.apply(dependency)))
                .orElse(new ArrayList<>());

        //check if value is already part of the list
        Optional<T> optionalValue = currentValues.stream()
                .filter(it -> getId.apply(it).equals(id))
                .findAny();
        if (optionalValue.isPresent()) {
            T value = optionalValue.get();
            //they share the same Id, but are not equal => the object was updated via PUT or something else
            if (!value.equals(objectToUpdate)) {
                //which is why we are replacing it with the newer value at the same position as before
                int index = currentValues.indexOf(value);
                currentValues.set(index, objectToUpdate);
            }
        }
        //the object is not part of the list yet => add it
        else {
            currentValues.add(objectToUpdate);
        }

        return currentValues;
    }

    public <T, DependencyType, IdType> Optional<DependencyType> manyToOne(T objectToUpdate,
                                                                          Function<T, DependencyType> getDependency,
                                                                          Function<T, IdType> getId,
                                                                          Function<DependencyType, List<T>> getCyclicListDependency,
                                                                          Function<DependencyType, Consumer<List<T>>> updateDependencyValues
    ) {
        DependencyType dependency = getDependency.apply(objectToUpdate);
        if (dependency != null) {
            List<T> currentValues = this.getUpdatedValues(objectToUpdate, dependency, getId, getCyclicListDependency);
            updateDependencyValues.apply(dependency).accept(currentValues);
        }

        return Optional.ofNullable(dependency);
    }

    public <T, DependencyType> List<DependencyType> oneToMany(T objectToUpdate,
                                                              Function<T, List<DependencyType>> getDependency,
                                                              Function<DependencyType, Consumer<T>> updateDependencyValue
    ) {
        List<DependencyType> dependencies = convertFromIndirectList(getDependency.apply(objectToUpdate));
        if (dependencies != null) {
            dependencies.stream().map(updateDependencyValue).forEach(it -> it.accept(objectToUpdate));
        }
        return Optional.ofNullable(dependencies).orElse(new ArrayList<>());
    }

    public <T, DependencyType> Optional<DependencyType> oneToOne(T objectToUpdate,
                                                                 Function<T, DependencyType> getDependency,
                                                                 Function<DependencyType, Consumer<T>> updateDependencyValue
    ) {
        DependencyType dependency = getDependency.apply(objectToUpdate);
        if (dependency != null) {
            updateDependencyValue.apply(dependency).accept(objectToUpdate);
        }
        return Optional.ofNullable(dependency);
    }

    public <T, DependencyType, IdType> List<DependencyType> manyToMany(T objectToUpdate,
                                                                       Function<T, List<DependencyType>> getDependency,
                                                                       Function<T, IdType> getId,
                                                                       Function<DependencyType, List<T>> getCyclicListDependency,
                                                                       Function<DependencyType, Consumer<List<T>>> updateDependencyValues
    ) {
        List<DependencyType> dependencies = convertFromIndirectList(getDependency.apply(objectToUpdate));
        if (dependencies != null) {
            dependencies.forEach(dependency -> {
                List<T> currentValues = this.getUpdatedValues(objectToUpdate, dependency, getId, getCyclicListDependency);
                updateDependencyValues.apply(dependency).accept(currentValues);
            });
        }
        return Optional.ofNullable(dependencies).orElse(new ArrayList<>());
    }





}
