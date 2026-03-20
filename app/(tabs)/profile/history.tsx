import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { apiClient } from '@/src/config/api';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { EmptyState } from '@/src/components/EmptyState';
import { StatusBadge } from '@/src/components/StatusBadge';
import { formatDate } from '@/src/utils/formatters';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Session {
  _id: string;
  recommendedProductId: { _id: string; name: string };
  outcome: 'accepted' | 'rejected' | 'pending';
  createdAt: string;
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/sessions');
      setSessions(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load chat history';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Chat History</Text>
          <View style={{ width: 24 }} />
        </View>
        <EmptyState
          icon="chat-outline"
          title="No Chat History"
          subtitle="Your recommendation chat sessions will appear here"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat History</Text>
        <View style={{ width: 24 }} />
      </View>

      {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

      <FlatList
        data={sessions}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sessionCard}
            onPress={() => router.push(`/(tabs)/profile/history/${item._id}`)}
          >
            <View style={styles.sessionContent}>
              <Text style={styles.sessionIcon}>💬 Chat Session</Text>
              <Text style={styles.productName}>
                Product: {item.recommendedProductId.name}
              </Text>
              <View style={styles.footer}>
                <StatusBadge status={item.outcome} />
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionContent: {
    flex: 1,
  },
  sessionIcon: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  chevron: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textMuted,
    marginLeft: SPACING.md,
  },
});
