import { Role } from "./Role";

export interface User {
  _id?: string;
  full_name?: string;
  username?: string;
  role?: Role;
  mobile_number?: string;
  email?: string;
  area?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_active?: string;
}

export interface UserData {
  _id?: string;
  full_name?: string;
  username?: string;
  role?: Role;
  mobile_number?: string;
  email?: string;
  area?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_active?: string;
}
