import { Types } from 'mongoose';

export interface storeInterface {
  name: string;
  email: string;
  contact_number: string;
  description: string;
  owner: string | Record<string, any> | Record<string, any>[];
  metadata?: {
    platform: string;
    os: string;
    browser: string;
    ip: string;
  };
  delivery_radius: number;
  avatar?: string;
  address: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  country?: string;
  website?: string;
  open_time?: string;
  close_time?: string;
  status?: string;
  is_activated?: boolean;
  bestSeller?: boolean;
  note?: string;
  admin_note?: string;
  createdAt?: string;
  updatedAt?: string;
}

//  name
// email
// contact_no
// products
// employees
// description
// metadata: {platform, os, browser, ip}
// delivery_radius
// avatar
// address
// latitude
// longitude
// location
// country
// website
// open_time
// close_time
// status
// is_activated
// bestSeller
// notes
// admin_notes
// createdAt
// updatedAt
