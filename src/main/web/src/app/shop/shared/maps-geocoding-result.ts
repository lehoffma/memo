export interface MapsGeocodingResult {
	address_components: {
		long_name: string;
		short_name: string;
		types: string[]
	}[];
	formatted_address: string;
	geometry: {
		bounds: {
			south: number;
			west: number;
			north: number;
			east: number;
		},
		location: {
			lat: () => number;
			lng: () => number;
		},
		location_type: string;
		viewport: {
			south: number;
			west: number;
			north: number;
			east: number;
		}
	},
	place_id: string;
	types: string[];
}
