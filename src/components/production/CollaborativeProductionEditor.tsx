"use client";

import React, { useState, useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

interface CollaborativeProductionEditorProps {
  productionId: string;
  workspaceId: string;
  token?: string;
  content: string;
  onContentChange: (content: string) => void;
}

interface RemoteUser {
  userId: string;
  x: number;
  y: number;
}

export function CollaborativeProductionEditor({
  productionId,
  workspaceId,
  token,
  content,
  onContentChange,
}: CollaborativeProductionEditorProps) {
  const { connected, emit, on, off } = useWebSocket({
    workspaceId,
    productionId,
    token,
  });

  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(
    new Map()
  );
  const [comments, setComments] = useState<
    Array<{
      id: string;
      userId: string;
      text: string;
      timestamp: Date;
      x?: number;
      y?: number;
    }>
  >([]);
  const [selectedText, setSelectedText] = useState("");
  const [commentText, setCommentText] = useState("");

  // Listen for content updates
  React.useEffect(() => {
    const handleContentUpdate = (data: {
      userId: string;
      field: string;
      value: string;
    }) => {
      if (data.field === "content") {
        onContentChange(data.value);
      }
    };

    on("production-content-updated", handleContentUpdate);
    return () => off("production-content-updated");
  }, [on, off, onContentChange]);

  // Listen for cursor movements
  React.useEffect(() => {
    const handleCursorMove = (data: {
      userId: string;
      x: number;
      y: number;
    }) => {
      setRemoteUsers((prev) => {
        const newUsers = new Map(prev);
        newUsers.set(data.userId, {
          userId: data.userId,
          x: data.x,
          y: data.y,
        });
        return newUsers;
      });
    };

    on("user-cursor-moved", handleCursorMove);
    return () => off("user-cursor-moved");
  }, [on, off]);

  // Listen for comments
  React.useEffect(() => {
    const handleCommentAdded = (data: {
      id: string;
      userId: string;
      text: string;
      timestamp: Date;
      position?: { x: number; y: number };
    }) => {
      setComments((prev) => [...prev, data]);
    };

    on("comment-added", handleCommentAdded);
    return () => off("comment-added");
  }, [on, off]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      onContentChange(newContent);
      emit("edit-production-content", {
        productionId,
        field: "content",
        value: newContent,
        timestamp: Date.now(),
      });
    },
    [productionId, emit, onContentChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      emit("cursor-move", {
        productionId,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [productionId, emit]
  );

  const handleAddComment = useCallback(() => {
    if (!selectedText || !commentText) return;

    emit("add-comment", {
      productionId,
      text: commentText,
      position: { x: 0, y: 0 },
    });

    setCommentText("");
    setSelectedText("");
  }, [productionId, selectedText, commentText, emit]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Production Editor</h3>
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Remote Cursors Indicator */}
      {remoteUsers.size > 0 && (
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground">
            Editing with {remoteUsers.size} other{" "}
            {remoteUsers.size === 1 ? "user" : "users"}:
          </span>
          {Array.from(remoteUsers.keys()).map((userId) => (
            <div
              key={userId}
              className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs"
            >
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              {userId.slice(0, 8)}
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onMouseMove={handleMouseMove}
        onSelect={(e) =>
          setSelectedText(content.substring(e.currentTarget.selectionStart, e.currentTarget.selectionEnd))
        }
        className="min-h-64 w-full rounded-lg border border-border bg-card p-4 font-mono text-sm"
        placeholder="Edit production content..."
      />

      {/* Comment Section */}
      {selectedText && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-sm">
            Selected: <span className="font-mono text-xs">{selectedText.slice(0, 50)}</span>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddComment}
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/80"
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-3 text-sm font-semibold">Comments</h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded bg-muted/50 p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{comment.userId.slice(0, 8)}</span>
                  <span className="text-muted-foreground">
                    {new Date(comment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
