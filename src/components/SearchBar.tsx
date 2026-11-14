import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

/* =====================================================
   SEARCH BAR
   Kolom pencarian yang dipakai bersama di halaman
   Orders, Planning, Materials, dan Users supaya
   tampilannya sama di seluruh aplikasi.
===================================================== */

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Cari...",
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color="#9ca3af" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={8}
          accessibilityLabel="Hapus pencarian"
        >
          <Ionicons name="close-circle" size={18} color="#9ca3af" />
        </Pressable>
      )}
    </View>
  );
}

/**
 * Mengembalikan true jika salah satu field berisi kata kunci
 * (tidak membedakan huruf besar dan kecil).
 * Kata kunci kosong berarti semua data ditampilkan.
 */
export function matchesSearch(
  keyword: string,
  ...fields: (string | number | null | undefined)[]
) {
  const text = keyword.trim().toLowerCase();

  if (!text) {
    return true;
  }

  return fields.some((field) =>
    String(field ?? "").toLowerCase().includes(text)
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },

  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#111111",
    outlineStyle: "none",
  } as any,
});
