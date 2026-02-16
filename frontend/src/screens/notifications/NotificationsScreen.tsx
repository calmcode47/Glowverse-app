import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as NotifAPI from "../../services/api/notifications.api";
import NotificationCard from "../../components/notifications/NotificationCard";
import { useNotifications } from "../../context/NotificationsContext";
import { useEffect } from "react";
import { measureScreenLoad } from "../../utils/performanceMonitor";
import { deepLinkingService } from "../../services/deepLinking.service";
import { analytics } from "../../services/analytics.service";

function groupLabel(d: Date): "Today" | "Yesterday" | "This Week" | "Older" {
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 7) return "This Week";
  return "Older";
}

type Filter = "all" | "unread" | "orders" | "promotions" | "social";

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { notifications, loading, markAllAsRead, markAsRead, deleteNotification, refreshNotifications } = useNotifications();
  const [groups, setGroups] = React.useState<Record<string, NotifAPI.AppNotification[]>>({});
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 30;
  useEffect(() => {
    const end = measureScreenLoad("Notifications");
    analytics.logEvent({ name: "notification_center_opened", properties: {} }).catch(() => {});
    return end;
  }, []);

  const load = React.useCallback(async () => {
    const filtered = notifications.filter((n) => {
      if (filter === "unread" && n.read) return false;
      if (filter === "orders" && n.type !== "order") return false;
      if (filter === "promotions" && n.type !== "promo") return false;
      if (filter === "social" && n.type !== "social") return false;
      if (query) {
        const q = query.toLowerCase();
        if (!(n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))) return false;
      }
      return true;
    }).slice(0, page * pageSize);
    const g: Record<string, NotifAPI.AppNotification[]> = {};
    filtered.forEach(n => {
      const label = groupLabel(new Date(n.createdAt));
      (g[label] = g[label] || []).push(n as any);
    });
    setGroups(g);
  }, [notifications, filter, query, page]);

  React.useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => { await markAllAsRead(); };

  const navigateDeepLink = (deep?: string) => {
    if (!deep) return;
    if (deep.startsWith("glowverse://") || deep.startsWith("https://")) {
      deepLinkingService.navigate(deep);
      return;
    }
    const [type, id] = deep.split(":");
    if (type === "order") (navigation as any).navigate("OrderDetail", { orderId: id });
    else if (type === "product") (navigation as any).navigate("ProductDetail", { productId: id });
    else if (type === "promo") (navigation as any).navigate("Promotions", {});
    else if (type === "notifications") (navigation as any).navigate("Notifications", {});
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
              await markAsRead(n.id)
              navigateDeepLink(n.deepLink);
            }}
            onDelete={async () => {
              await deleteNotification(n.id)
            }}
          />
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ProfessionalBackground variant="subtle" />

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

      <View style={styles.tabs}>
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "orders", label: "Orders" },
          { key: "promotions", label: "Promotions" },
          { key: "social", label: "Social" }
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              setFilter(t.key as Filter);
              setPage(1);
              analytics.logEvent({ name: "notification_filter_changed", properties: { filter: t.key } }).catch(() => {});
            }}
            style={[styles.tab, filter === (t.key as Filter) && { borderBottomColor: theme.colors.accent.emerald, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: theme.colors.text.primary, opacity: filter === (t.key as Filter) ? 1 : 0.6 }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.searchWrap, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated }]}>
        <MaterialCommunityIcons name="magnify" color={theme.colors.text.secondary} size={20} />
        <TextInput
          placeholder="Search notifications"
          placeholderTextColor={theme.colors.text.tertiary}
          value={query}
          onChangeText={(t) => {
            if (!query) analytics.logEvent({ name: "notification_search_used", properties: {} }).catch(() => {});
            setQuery(t);
            setPage(1);
          }}
          style={[styles.searchInput, { color: theme.colors.text.primary }]}
        />
        {!!query && (
          <TouchableOpacity onPress={() => { setQuery(""); setPage(1); }}>
            <MaterialCommunityIcons name="close" color={theme.colors.text.secondary} size={18} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={Object.entries(groups)}
        renderItem={renderGroup}
        keyExtractor={([label]) => label}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshNotifications}
        refreshing={loading}
        ListFooterComponent={
          Object.values(groups).flat().length < notifications.filter((n) => {
            if (filter === "unread" && n.read) return false;
            if (filter === "orders" && n.type !== "order") return false;
            if (filter === "promotions" && n.type !== "promo") return false;
            if (filter === "social" && n.type !== "social") return false;
            if (query) {
              const q = query.toLowerCase();
              if (!(n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))) return false;
            }
            return true;
          }).length ? (
            <TouchableOpacity onPress={() => setPage((p) => p + 1)} style={styles.loadMore}>
              <Text style={{ color: theme.colors.accent.blue, fontWeight: "800" }}>Load more...</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: theme.colors.text.secondary, textAlign: "center", marginTop: 24 }}>
              {filter === "all" ? "No notifications yet" :
               filter === "unread" ? "You're all caught up!" :
               filter === "orders" ? "No order updates" :
               filter === "promotions" ? "No promotions right now" :
               "No social activity"}
            </Text>
          ) : null
        }
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
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginBottom: 8 },
  tab: { paddingVertical: 10 },
  tabText: { fontSize: 14, fontWeight: '800' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  searchInput: { flex: 1 },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadMore: { alignSelf: 'center', padding: 14 },
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
