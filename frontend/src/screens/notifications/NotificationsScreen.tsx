import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as NotifAPI from "../../services/api/notifications.api";
import NotificationCard from "../../components/notifications/NotificationCard";

function groupLabel(d: Date): "Today" | "Yesterday" | "This Week" | "Older" {
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 7) return "This Week";
  return "Older";
}

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [notifications, setNotifications] = React.useState<NotifAPI.AppNotification[]>([]);
    const [groups, setGroups] = React.useState<Record<string, NotifAPI.AppNotification[]>>({});
    const [loading, setLoading] = React.useState(true);

    const load = React.useCallback(async () => {
      setLoading(true);
      try {
        const list = await NotifAPI.list();
        setNotifications(list);
        const g: Record<string, NotifAPI.AppNotification[]> = {};
        list.forEach(n => {
          const label = groupLabel(new Date(n.createdAt));
          (g[label] = g[label] || []).push(n);
        });
        setGroups(g);
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => { load(); }, [load]);

    const handleMarkAllRead = async () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      try { await NotifAPI.markAllRead(); } catch {}
    };

    const navigateDeepLink = (deep?: string) => {
      if (!deep) return;
      const [type, id] = deep.split(":");
      if (type === "order") navigation.navigate("OrderDetail" as never, { orderId: id } as never);
      else if (type === "product") navigation.navigate("ProductDetail" as never, { productId: id } as never);
      else if (type === "promo") navigation.navigate("HomeTab" as never, {} as never);
    };

    const renderGroup = ({ item, index }: { item: [string, NotifAPI.AppNotification[]], index: number }) => {
      const [label, items] = item;
      return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
          <Text style={[styles.groupTitle, { color: theme.colors.text.secondary }]}>{label}</Text>
          {items.map((n, i) => (
            <NotificationCard
              key={n.id}
              item={n}
              onPress={async () => {
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                try { await NotifAPI.markRead(n.id); } catch {}
                navigateDeepLink(n.deepLink);
              }}
              onDelete={async () => {
                setNotifications(prev => prev.filter(x => x.id !== n.id));
                try { await NotifAPI.remove(n.id); } catch {}
              }}
            />
          ))}
        </Animated.View>
      );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <ProfessionalBackground variant="subtle" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.background.elevated }]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={[styles.markRead, { color: theme.colors.accent.blue }]}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
              data={Object.entries(groups)}
              renderItem={renderGroup}
              keyExtractor={([label]) => label}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={!loading ? <Text style={{ color: theme.colors.text.secondary, textAlign: "center", marginTop: 24 }}>No notifications yet</Text> : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    markRead: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    groupTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
});
