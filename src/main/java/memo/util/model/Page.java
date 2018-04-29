package memo.util.model;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;

public class Page<T> {
    private List<T> content;
    private Integer page;
    private Integer elements;
    private Long totalElements;
    private Integer pageSize;
    private Boolean first;
    private Boolean last;

    public Page() {
        this(new ArrayList<>(), new PageRequest(), 0);
    }

    public Page(List<T> content, PageRequest pageRequest, long amountOfElements) {
        Integer pageNumber = pageRequest.getPage();
        Integer pageSize = pageRequest.getPageSize();
        boolean first = pageNumber == 1;
        boolean last = content.size() < pageSize || amountOfElements == (pageNumber * pageSize);

        this
                .setContent(content)
                .setElements(content.size())
                .setFirst(first)
                .setLast(last)
                .setPage(pageRequest.getPage())
                .setPageSize(pageSize)
                .setTotalElements(amountOfElements);
    }

    /**
     * @param query
     * @param countQuery
     * @param pageRequest
     * @param <T>
     * @return
     */
    public static <T> Page<T> fromQuery(TypedQuery<T> query, Query countQuery, PageRequest pageRequest) {
        int pageNumber = pageRequest.getPage();
        int pageSize = pageRequest.getPageSize();
        query.setFirstResult((pageNumber - 1) * pageSize);
        query.setMaxResults(pageSize);
        List<T> content = query.getResultList();

        long amountOfElements = (long) countQuery.getSingleResult();

        return new Page<>(content, pageRequest, amountOfElements);
    }

    public boolean isEmpty() {
        return this.content.isEmpty();
    }

    public List<T> getContent() {
        return content;
    }

    public Page<T> setContent(List<T> content) {
        this.content = content;
        return this;
    }

    public Integer getPage() {
        return page;
    }

    public Page<T> setPage(Integer page) {
        this.page = page;
        return this;
    }

    public Integer getElements() {
        return elements;
    }

    public Page<T> setElements(Integer elements) {
        this.elements = elements;
        return this;
    }

    public Long getTotalElements() {
        return totalElements;
    }

    public Page<T> setTotalElements(Long totalElements) {
        this.totalElements = totalElements;
        return this;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public Page<T> setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
        return this;
    }

    public Boolean getFirst() {
        return first;
    }

    public Page<T> setFirst(Boolean first) {
        this.first = first;
        return this;
    }

    public Boolean getLast() {
        return last;
    }

    public Page<T> setLast(Boolean last) {
        this.last = last;
        return this;
    }
}
