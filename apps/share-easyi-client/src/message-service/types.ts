import type { ConversationApi } from './core'
import type { TConversationId } from './domain/conversation'

export type TConversationStore = {
  convSyncStatus: 'idle' | 'loading'
  convs: Record<TConversationId, undefined | ConversationApi>
}
