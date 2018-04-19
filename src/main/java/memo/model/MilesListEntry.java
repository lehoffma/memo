package memo.model;

public class MilesListEntry {
    private Integer userId;
    private Integer miles;

    public Integer getUserId() {
        return userId;
    }

    public MilesListEntry setUserId(Integer userId) {
        this.userId = userId;
        return this;
    }

    public Integer getMiles() {
        return miles;
    }

    public MilesListEntry setMiles(Integer miles) {
        this.miles = miles;
        return this;
    }
}
