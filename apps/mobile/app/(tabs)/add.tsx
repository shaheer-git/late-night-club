/**
 * This tab route is intentionally empty.
 * The "Add" button in the TabBar navigates to /add-place (outside the tab group)
 * so the bottom navigation bar is hidden on that screen.
 *
 * This file must exist so Expo Router registers the tab slot and the TabBar
 * can render the Add icon correctly.
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AddTabRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/add-place');
  }, []);
  return null;
}
