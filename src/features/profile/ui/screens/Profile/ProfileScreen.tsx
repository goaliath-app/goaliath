import { useThemedStyles } from '@/shared/theme';
import { Link, useRouter, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useDeleteAllData } from '../../hooks/useDeleteAllData';
import { profileScreenStyles } from './ProfileScreen.styles';

/**
 * The profile hub (roadmap week 1 / architecture.md → "Navigation (app shell)").
 * The home for everything that is neither "see today" nor "create": settings,
 * stats, goals, a calendar. It is deliberately **thin** — a list of items that
 * navigate by route **path**, so the hub imports no other feature (an item's
 * destination is a URL, not a component). It grows into an account screen later.
 *
 * Only Goals is wired today; settings and stats land as their features arrive.
 */
interface HubItem {
  key: string;
  labelKey: 'profile.goalsLabel';
  hintKey: 'profile.goalsHint';
  href: Href;
}

const HUB_ITEMS: readonly HubItem[] = [
  {
    key: 'goals',
    labelKey: 'profile.goalsLabel',
    hintKey: 'profile.goalsHint',
    href: '/goals',
  },
];

export function ProfileScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const styles = useThemedStyles(profileScreenStyles);

  const deleteAllData = useDeleteAllData();

  const handleDeleteAllData = (): void => {
    Alert.alert(
      t('profile.deleteAllDataAlertTitle'),
      t('profile.deleteAllDataAlertMessage'),
      [
        { text: t('profile.deleteAllDataCancel'), style: 'cancel' },
        {
          text: t('profile.deleteAllDataConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllData();
            } catch (error) {
              const message = (error as Error).message ?? t('profile.deleteAllDataFailed');
              Alert.alert(t('profile.deleteAllDataAlertTitle'), message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={() => router.back()}
        >
          <ChevronLeft />
        </Pressable>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <ScrollView>
        {HUB_ITEMS.map((item) => (
          <Link key={item.key} href={item.href} asChild>
            <Pressable style={styles.item} accessibilityRole="button">
              <View style={styles.itemText}>
                <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
                <Text style={styles.itemHint}>{t(item.hintKey)}</Text>
              </View>
              <ChevronRight/>
            </Pressable>
          </Link>
        ))}
        <Pressable style={styles.item} accessibilityRole="button" onPress={handleDeleteAllData}>
          <View style={styles.itemText}>
            <Text style={styles.itemLabel}>{t('profile.deleteAllDataLabel')}</Text>
            <Text style={styles.itemHint}>{t('profile.deleteAllDataHint')}</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
