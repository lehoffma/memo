package memo.api.util;

import memo.util.model.Filter;
import memo.util.model.PageRequest;
import memo.util.model.Sort;

import java.util.*;
import java.util.stream.Collectors;

public class UrlParseHelper {
    public static Sort readSort(Map<String, String[]> parameterMap) {
        //example: 'sortBy=price&descending=true'
        List<String> sortBys = Arrays.stream(parameterMap.getOrDefault("sortBy", new String[]{}))
                .collect(Collectors.toList());
        Sort.Direction direction = Arrays.stream(
                parameterMap.getOrDefault("direction", new String[]{sortBys.size() > 0 ? "desc" : "none"})
        )
                .map(Sort.Direction::getByQueryValue)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList())
                .get(0);

        if (direction == null) {
            direction = Sort.Direction.NONE;
        }

        return Sort.by(direction, sortBys);
    }


    public static Filter readFilter(Map<String, String[]> parameterMap) {
        return Filter.by(
                parameterMap.entrySet().stream()
                        .filter(UrlParseHelper::isNotSortingParameter)
                        .map(UrlParseHelper::toFilterRequest)
                        .collect(Collectors.toList())
        );
    }

    private static boolean isNotSortingParameter(Map.Entry<String, String[]> entry) {
        String key = entry.getKey();
        return !key.equalsIgnoreCase("sortBy") && !key.equalsIgnoreCase("direction")
                && !key.equalsIgnoreCase("page") && !key.equalsIgnoreCase("pageSize");
    }

    private static Filter.FilterRequest toFilterRequest(Map.Entry<String, String[]> entry) {
        List<String> filterValues = Arrays.stream(entry.getValue())
                .map(it -> it.split("\\|"))
                .map(Arrays::asList)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());

        return new Filter().new FilterRequest()
                .setKey(entry.getKey())
                .setValues(filterValues);
    }


    public static PageRequest readPageRequest(Map<String, String[]> parameterMap) {
        Integer page = Integer.valueOf(parameterMap.getOrDefault("page", new String[]{"0"})[0]) + 1;
        Integer pageSize = Integer.valueOf(parameterMap.getOrDefault("pageSize", new String[]{"50"})[0]);

        return new PageRequest()
                .setPage(page)
                .setPageSize(pageSize);
    }
}