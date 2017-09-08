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
			key: "birthday",
			isDate: true
		},
		{
			name: "Geschlecht",
			icon: "person",
			key: "gender",
		},
		{
			name: "Dabei seit",
			icon: "event",
			key: "joinDate",
			isDate: true
		},

		{
			name: "Meilen",
			icon: "directions_car",
			key: "miles"
		},
	],
];
