export interface userInterface {
  // firstname: string;
  // lastname: string
  fullname: string;
  email: string;
  age: number;
  gender: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  contact_number: string;
  alter_contact_number: string;
  is_activated: boolean;
  email: string;
  role: string;
  updated_at: Date;
}
