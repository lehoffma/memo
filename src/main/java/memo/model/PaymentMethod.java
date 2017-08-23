package memo.model;

import com.google.gson.annotations.SerializedName;

public enum PaymentMethod {

    @SerializedName("0")
    Bar,
    @SerializedName("1")
    Lastschrift,
    @SerializedName("2")
    Ueberweisung,
    @SerializedName("3")
    Paypal
}
