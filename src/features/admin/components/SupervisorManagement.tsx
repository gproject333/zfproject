"use client";

import UserManagementShell from "./userManagement/UserManagementShell";
import { SUPERVISOR_CONFIG } from "./userManagement/config";

export default function SupervisorManagement() {
  return <UserManagementShell config={SUPERVISOR_CONFIG} />;
}
