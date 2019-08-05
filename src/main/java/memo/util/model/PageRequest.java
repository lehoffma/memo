package memo.util.model;

public class PageRequest {
    private Integer page = 0;
    private Integer pageSize = 0;

    public Integer getPage() {
        return page;
    }

    public PageRequest setPage(Integer page) {
        this.page = page;
        return this;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public PageRequest setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
        return this;
    }

    public static PageRequest all() {
        return new PageRequest().setPage(0).setPageSize(10000);
    }
}
