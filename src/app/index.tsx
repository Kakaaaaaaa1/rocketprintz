import { Redirect } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const {
    user,
    profile,
    loading,
    logout,
  } = useAuth();

  // Tombol keluar untuk akun yang profilnya tidak valid
  const logoutButton = (
    <Pressable
      style={styles.button}
      onPress={() => {
        logout().catch(() => undefined);
      }}
    >
      <Text style={styles.buttonText}>
        Keluar
      </Text>
    </Pressable>
  );

  // Tunggu Firebase Auth + profile Firestore selesai
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>
          Memuat akun...
        </Text>
      </View>
    );
  }

  // Belum login
  if (!user) {
    return (
      <Redirect href="/login" />
    );
  }

  // User sudah login tetapi profile tidak ditemukan
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Akun belum terdaftar di sistem.
        </Text>

        <Text style={styles.text}>
          Hubungi Admin untuk mendaftarkan akun Anda.
        </Text>

        {logoutButton}
      </View>
    );
  }

  // ADMIN
  if (profile.role === "admin") {
    return (
      <Redirect href="/admin" />
    );
  }

  // OPERATOR
  if (profile.role === "operator") {
    return (
      <Redirect href="/operator" />
    );
  }

  // SUPERVISOR
  if (profile.role === "supervisor") {
    return (
      <Redirect href="/supervisor" />
    );
  }

  // Role tidak dikenali
  return (
    <View style={styles.container}>
      <Text style={styles.error}>
        Peran akun tidak dikenali.
      </Text>

      <Text style={styles.text}>
        Hubungi Admin untuk mengatur peran akun Anda.
      </Text>

      {logoutButton}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 24,
  },

  text: {
    marginTop: 12,
    textAlign: "center" as const,
    color: "#666",
  },

  error: {
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },

  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: "#0f172a",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "700" as const,
  },
};
