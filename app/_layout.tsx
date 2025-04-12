import { Stack } from "expo-router";  // Importa Stack da expo-router

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{ headerShown: false }}  // Disabilita l'header di default globalmente
    />
  );
}
