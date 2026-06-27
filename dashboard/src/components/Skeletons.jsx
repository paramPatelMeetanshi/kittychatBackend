/**
 * Reusable skeleton primitives and page-specific skeleton layouts
 */

// Base shimmer block
function Bone({ className = "" }) {
  return (
    <div className={`animate-pulse bg-warm rounded-lg ${className}`} />
  );
}

// Circle skeleton (avatars)
function BoneCircle({ size = "w-10 h-10" }) {
  return <div className={`animate-pulse bg-warm rounded-full ${size}`} />;
}

// Text line skeleton
function BoneLine({ width = "w-full", height = "h-3" }) {
  return <div className={`animate-pulse bg-warm rounded ${width} ${height}`} />;
}

// --- Conversation List Skeleton ---
export function ConversationListSkeleton() {
  return (
    <div className="w-80 border-r border-dark-100 bg-cream flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-dark-100">
        <div className="flex items-center justify-between mb-3">
          <Bone className="w-20 h-6" />
          <div className="flex gap-2">
            <Bone className="w-16 h-7 rounded-full" />
            <Bone className="w-7 h-7 rounded-full" />
          </div>
        </div>
      </div>
      {/* Conversation items */}
      <div className="flex-1 p-2 space-y-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <BoneCircle />
            <div className="flex-1 space-y-2">
              <BoneLine width="w-28" height="h-3.5" />
              <BoneLine width="w-40" height="h-2.5" />
            </div>
            <Bone className="w-8 h-3" />
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-4 py-3 border-t border-dark-100 flex items-center justify-between">
        <BoneLine width="w-24" height="h-3" />
        <BoneLine width="w-16" height="h-3" />
      </div>
    </div>
  );
}

// --- Chat Panel Skeleton ---
export function ChatPanelSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-cream">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-100 flex items-center gap-3">
        <BoneCircle size="w-9 h-9" />
        <div className="space-y-2">
          <BoneLine width="w-28" height="h-3.5" />
          <BoneLine width="w-20" height="h-2.5" />
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 p-5 space-y-4">
        {/* Visitor message */}
        <div className="flex items-end gap-2">
          <BoneCircle size="w-7 h-7" />
          <Bone className="w-48 h-12 rounded-2xl rounded-bl-md" />
        </div>
        {/* Agent message */}
        <div className="flex items-end gap-2 justify-end">
          <Bone className="w-56 h-10 rounded-2xl rounded-br-md" />
          <BoneCircle size="w-7 h-7" />
        </div>
        {/* Visitor message */}
        <div className="flex items-end gap-2">
          <BoneCircle size="w-7 h-7" />
          <Bone className="w-36 h-10 rounded-2xl rounded-bl-md" />
        </div>
        {/* Agent message */}
        <div className="flex items-end gap-2 justify-end">
          <Bone className="w-44 h-14 rounded-2xl rounded-br-md" />
          <BoneCircle size="w-7 h-7" />
        </div>
        {/* Visitor message */}
        <div className="flex items-end gap-2">
          <BoneCircle size="w-7 h-7" />
          <Bone className="w-52 h-10 rounded-2xl rounded-bl-md" />
        </div>
      </div>
      {/* Input */}
      <div className="p-4 border-t border-dark-100">
        <div className="flex gap-2">
          <Bone className="w-10 h-10 rounded-lg" />
          <Bone className="flex-1 h-10 rounded-lg" />
          <Bone className="w-14 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// --- Settings Page Skeleton (AgenticSettings / EmailSettings) ---
export function SettingsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-cream p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bone className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <BoneLine width="w-40" height="h-5" />
            <BoneLine width="w-56" height="h-3" />
          </div>
        </div>
        {/* Cards */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-sand rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bone className="w-9 h-9 rounded-lg" />
                <div className="space-y-2">
                  <BoneLine width="w-32" height="h-3.5" />
                  <BoneLine width="w-48" height="h-2.5" />
                </div>
              </div>
              <Bone className="w-10 h-6 rounded-full" />
            </div>
            {i < 2 && (
              <div className="pt-3 border-t border-dark-100 space-y-2">
                <BoneLine width="w-full" height="h-3" />
                <BoneLine width="w-3/4" height="h-3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Articles Page Skeleton ---
export function ArticlesSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-cream overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-sand border-b border-dark-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bone className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <BoneLine width="w-24" height="h-5" />
            <BoneLine width="w-48" height="h-3" />
          </div>
        </div>
        <Bone className="w-28 h-9 rounded-lg" />
      </div>
      {/* Article list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-sand rounded-xl p-4 flex items-center gap-4">
            <Bone className="w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <BoneLine width="w-48" height="h-4" />
              <BoneLine width="w-32" height="h-2.5" />
            </div>
            <div className="flex gap-2">
              <Bone className="w-7 h-7 rounded" />
              <Bone className="w-7 h-7 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Visitors Page Skeleton ---
export function VisitorsSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-cream overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-sand border-b border-dark-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Bone className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <BoneLine width="w-24" height="h-5" />
              <BoneLine width="w-32" height="h-3" />
            </div>
          </div>
        </div>
        {/* Stat badges */}
        <div className="flex gap-3 mb-3">
          <Bone className="w-20 h-8 rounded-full" />
          <Bone className="w-20 h-8 rounded-full" />
          <Bone className="w-20 h-8 rounded-full" />
        </div>
        {/* Search */}
        <Bone className="w-full h-9 rounded-lg" />
      </div>
      {/* Visitor rows */}
      <div className="flex-1 overflow-y-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4 border-b border-dark-50">
            <BoneCircle />
            <div className="flex-1 space-y-2">
              <BoneLine width="w-32" height="h-3.5" />
              <BoneLine width="w-48" height="h-2.5" />
            </div>
            <Bone className="w-16 h-3" />
            <Bone className="w-6 h-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Visitor Panel Skeleton (right side) ---
export function VisitorPanelSkeleton() {
  return (
    <div className="w-72 border-l border-dark-100 bg-sand p-4 space-y-4">
      <div className="flex items-center gap-3">
        <BoneCircle size="w-12 h-12" />
        <div className="space-y-2 flex-1">
          <BoneLine width="w-24" height="h-4" />
          <BoneLine width="w-16" height="h-2.5" />
        </div>
      </div>
      <Bone className="w-full h-px" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <BoneLine width="w-16" height="h-2.5" />
          <BoneLine width="w-full" height="h-3" />
        </div>
      ))}
      <Bone className="w-full h-px" />
      <BoneLine width="w-20" height="h-3" />
      <Bone className="w-full h-20 rounded-lg" />
    </div>
  );
}
