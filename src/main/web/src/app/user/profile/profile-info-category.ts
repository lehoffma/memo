export interface ProfileInfoCategory {
	name: string,
	icon: string,
	key: string,
	isDate?: boolean
}

export type ProfileCategory = ProfileInfoCategory[];

export const profileCategories: ProfileCategory[] = [
	[
		{
			name: "Geburtstag",
			icon: "cake",
			key: "birthDate",
			isDate: true
		},
		{
			name: "Telefonnummer",
			icon: "local_phone",
			key: "telephone"
		},
		{
			name: "Email-Adresse",
			icon: "local_post_office",
			key: "email"
		},

		{
			name: "Meilen",
			icon: "directions_car",
			key: "miles"
		},
	],
];
