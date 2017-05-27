package memo.model;

/*
	 0 : none,
	 1 : read,
	 2 : write,
	 3 : create,
	 4 : delete,
	 5 : admin
	  */

import com.google.gson.annotations.SerializedName;

public enum Permission {
	@SerializedName("0")
	none,
	@SerializedName("1")
	read,
	@SerializedName("2")
	write,
	@SerializedName("3")
	create,
	@SerializedName("4")
	delete,
	@SerializedName("5")
	admin
}


