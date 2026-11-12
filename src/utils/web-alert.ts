import { Alert, Platform } from "react-native";

type WebAlertButton = { text?: string; style?: string; onPress?: (value?: string) => void };

if (Platform.OS === "web" && typeof window !== "undefined") {
  Alert.alert = (title: string, message?: string, buttons?: WebAlertButton[]) => {
    const text = [title, message].filter(Boolean).join("\n\n");
    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }
    const cancelButton = buttons.find((b) => b.style === "cancel");
    const actionButton = buttons.find((b) => b.style !== "cancel") ?? buttons[buttons.length - 1];
    if (window.confirm(text)) {
      actionButton?.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }
  };
}
