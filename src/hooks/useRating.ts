import { useState, useCallback } from 'react';
import { UFOEvent } from '@/types/event';

export type RatingType = 'like' | 'dislike';

interface UseRatingProps {
  event: UFOEvent | null;
  onEventUpdate?: (updatedEvent: UFOEvent) => void;
}

interface RatingState {
  userVote: RatingType | null;
  isSubmitting: boolean;
  hasVoted: boolean;
}

export const useRating = ({ event, onEventUpdate }: UseRatingProps) => {
  const [ratingState, setRatingState] = useState<Record<string, RatingState>>({});

  // Get rating state for current event
  const getCurrentRatingState = useCallback((eventId: string): RatingState => {
    return ratingState[eventId] || {
      userVote: null,
      isSubmitting: false,
      hasVoted: false
    };
  }, [ratingState]);

  // Submit rating to API - matches original rating system functionality
  const submitRating = useCallback(async (eventId: string, rating: RatingType): Promise<boolean> => {
    try {
      const response = await fetch(`/api/events/${eventId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          rating: rating.toUpperCase(), // 'LIKE' or 'DISLIKE'
          eventId 
        })
      });

      if (!response.ok) {
        throw new Error(`Rating submission failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success || true;
    } catch (error) {
      console.error('Failed to submit rating:', error);
      return false;
    }
  }, []);

  // Handle rating click - matches original rating system (script.js rating functions)
  const handleRating = useCallback(async (rating: RatingType) => {
    if (!event) return;

    const eventId = event.id;
    const currentState = getCurrentRatingState(eventId);

    // Prevent multiple submissions
    if (currentState.isSubmitting) return;

    // Check if user already voted this way
    if (currentState.userVote === rating) {
      // TODO: In a real app, this could allow removing votes
      return;
    }

    // Update UI state immediately (optimistic update)
    setRatingState(prev => ({
      ...prev,
      [eventId]: {
        ...currentState,
        isSubmitting: true
      }
    }));

    // Calculate optimistic counts
    const updatedEvent = { ...event };
    const wasLike = currentState.userVote === 'like';
    const wasDislike = currentState.userVote === 'dislike';
    const isLike = rating === 'like';

    if (isLike) {
      updatedEvent.likes = event.likes + 1;
      if (wasDislike) {
        updatedEvent.dislikes = Math.max(0, event.dislikes - 1);
      }
    } else {
      updatedEvent.dislikes = event.dislikes + 1;
      if (wasLike) {
        updatedEvent.likes = Math.max(0, event.likes - 1);
      }
    }

    // Update event immediately for UI feedback
    if (onEventUpdate) {
      onEventUpdate(updatedEvent);
    }

    // Submit to API
    const success = await submitRating(eventId, rating);

    // Update final state
    setRatingState(prev => ({
      ...prev,
      [eventId]: {
        userVote: success ? rating : currentState.userVote,
        isSubmitting: false,
        hasVoted: success ? true : currentState.hasVoted
      }
    }));

    // If submission failed, revert optimistic update
    if (!success && onEventUpdate) {
      onEventUpdate(event); // Revert to original
    }
  }, [event, getCurrentRatingState, submitRating, onEventUpdate]);

  // Get rating state for current event
  const currentEventState = event ? getCurrentRatingState(event.id) : null;

  return {
    handleLike: () => handleRating('like'),
    handleDislike: () => handleRating('dislike'),
    userVote: currentEventState?.userVote || null,
    isSubmitting: currentEventState?.isSubmitting || false,
    hasVoted: currentEventState?.hasVoted || false
  };
};