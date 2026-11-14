// src/app/(admin)/_layout.tsx
import {
  Redirect,
  Stack,
  usePathname,
} from "expo-router";

import {
  ActivityIndicator,
  View,
} from "react-native";

import {
  useAuth,
} from "../../contexts/AuthContext";

import { getRoleRedirect } from "../../utils/role-route";

export default function AdminLayout() {

  const {
    user,
    profile,
    loading,
  } = useAuth();

  const pathname = usePathname();

  if (loading) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {

    return (
      <Redirect href="/(auth)/login" />
    );
  }

  if (
    !profile ||
    profile.role !== "admin"
  ) {

    return (
      <Redirect href={getRoleRedirect(profile?.role, pathname)} />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}