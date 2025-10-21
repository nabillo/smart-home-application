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
