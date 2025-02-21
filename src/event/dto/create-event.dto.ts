export class CreateEventDto {
  name: string;
  description: string;
  status: string;
  event_type: string;
  is_offline: boolean;
  owner_id: string;
  event_logo_url: string;
  event_background_url: string;
  organizer_logo_url: string;
  province_city: string;
  district_town: string;
  ward_commune: string;
  address_line: string;
}
