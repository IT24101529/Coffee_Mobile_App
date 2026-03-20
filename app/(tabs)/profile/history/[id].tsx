import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { apiClient } from '@/src/config/api';
import { formatDate } from '@/src/utils/formatters';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ErrorMessage';
import { StatusBadge } from '@/src/components/StatusBadge';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/src/config/colors';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Session {
  _id: string;
  recommendedProductId: { _id: string; name: string };
  outcome: 'accepted' | 'rejected' | 'pending';
  messages: Message[];
  createdAt: string;
}

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/sessions/${sessionId}`);
      setSession(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load session';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = () => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/sessions/${sessionId}`);
            Alert.alert('Success', 'Session deleted');
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete session');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Chat Session</Text>
          <View style={{ width: 24 }} />
        </View>
        <ErrorMessage message={error || 'Session not found'} onRetry={fetchSession} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat Session</Text>
        <TouchableOpacity onPress={handleDeleteSession}>
          <Trash2 size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.productTitle}>Recommended: {session.recommendedProductId.name}</Text>
        <View style={styles.infoBadges}>
          <StatusBadge status={session.outcome} />
          <Text style={styles.infoDate}>{formatDate(session.createdAt)}</Text>
        </View>
      </View>

      <FlatList
        data={session.messages || []}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userMessage : styles.botMessage
          ]}>
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userMessageText : styles.botMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={styles.messageTime}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteSession}
      >
        <Text style={styles.deleteButtonText}>Delete This Session</Text>
      </TouchableOpacity>
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
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  info: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  productTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoBadges: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  infoDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  messagesContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    marginBottom: SPACING.md,
    maxWidth: '85%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
