package memo.model;

import com.google.gson.annotations.SerializedName;

public enum OrderStatus {

    @SerializedName("0")
    Reserved,
    @SerializedName("1")
    Ordered,
    @SerializedName("2")
    Paid,
    @SerializedName("3")
    Sent,
    @SerializedName("4")
    Completed,
    @SerializedName("5")
    Cancelled,
    @SerializedName("6")
    Refused,
    @SerializedName("7")
    UnderApproval

}
