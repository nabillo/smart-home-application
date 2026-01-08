export interface Permission {
  permission_id: number;
  permission_name: string;
}

export interface Role {
  role_id: number;
  role_name: string;
  permissions: Permission[];
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  role_id: number | null;
  role_name: string | null;
}

export interface Room {
  room_id: string;
  home_id: string;
  name: string;
  icon: string;
}

export interface Device {
  device_id: string;
  home_id: string;
  room_id: string | null;
  name: string;
}

// Generic Parameter Definition
export interface ParameterDefinition {
  name: string;
  required: boolean;
  data_type: 'integer' | 'float' | 'string' | 'datetime' | 'boolean' | 'icon' | 'list';
  default_value?: any;
  options?: string[];
}

// Device Functionality Types
export interface FunctionalityType {
  functionality_type_id: string;
  name: string;
  description: string;
  parameters_definition: ParameterDefinition[];
}

export interface DeviceFunctionalityData {
  functionality_type_id: string;
  configured_parameters: Record<string, any>;
}

export interface NewDeviceData {
  name: string;
  room_id: string | null;
  functionalities: DeviceFunctionalityData[];
}

// Home Parameter Types
export interface HomeParameterType {
  parameter_type_id: string;
  name: string;
  description: string;
  parameters_definition: ParameterDefinition[];
}

export interface HomeParameterData {
  parameter_type_id: string;
  configured_parameters: Record<string, any>;
}

export interface NewHomeData {
  name: string;
  parameters: HomeParameterData[];
}

export interface Home {
  home_id: string;
  name: string;
  role_name?: string; // Role of the current user in this home
  parameters?: HomeParameterData[];
}
