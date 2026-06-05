"use client";

import UserManagementShell from "./userManagement/UserManagementShell";
import { ADMIN_CONFIG } from "./userManagement/config";

export default function AdminManagement() {
  return <UserManagementShell config={ADMIN_CONFIG} />;
}
