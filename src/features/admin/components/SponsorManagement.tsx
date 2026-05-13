"use client";

import UserManagementShell from "./userManagement/UserManagementShell";
import { SPONSOR_CONFIG } from "./userManagement/config";

export default function SponsorManagement() {
  return <UserManagementShell config={SPONSOR_CONFIG} />;
}
