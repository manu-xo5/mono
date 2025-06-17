export type TConversationId = string

export function ConversationId(from: string, to: string): TConversationId {
  return [from, to].sort().join('-')
}
