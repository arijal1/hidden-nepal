// stores/plannerStore.ts

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type {
  ItineraryInput,
  GeneratedItinerary,
  TravelStyle,
  TrekDifficulty,
} from "@/types";

interface PlannerState {
  // Form inputs
  input: ItineraryInput;

  // Generation state
  isGenerating: boolean;
  itinerary: GeneratedItinerary | null;
  streamingText: string;
  error: string | null;

  // UI state
  currentStep: number;
  activeDay: number;

  // Actions
  setInput: (input: Partial<ItineraryInput>) => void;
  setDays: (days: number) => void;
  setBudget: (budget: number) => void;
  setTravelStyle: (style: TravelStyle) => void;
  setTrekkingLevel: (level: TrekDifficulty) => void;
  toggleInterest: (interest: string) => void;
  setCurrentStep: (step: number) => void;
  setActiveDay: (day: number) => void;
  setGenerating: (generating: boolean) => void;
  setItinerary: (itinerary: GeneratedItinerary | null) => void;
  appendStreamingText: (text: string) => void;
  clearStreamingText: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultInput: ItineraryInput = {
  days: 7,
  budgetUsd: 800,
  travelStyle: "adventure",
  interests: [],
  trekkingLevel: "moderate",
  startCity: "Kathmandu",
};

export const usePlannerStore = create<PlannerState>()(
  devtools(
    persist(
      (set) => ({
        input: defaultInput,
        isGenerating: false,
        itinerary: null,
        streamingText: "",
        error: null,
        currentStep: 0,
        activeDay: 1,

        setInput: (partial) =>
          set((state) => ({ input: { ...state.input, ...partial } })),

        setDays: (days) =>
          set((state) => ({ input: { ...state.input, days } })),

        setBudget: (budgetUsd) =>
          set((state) => ({ input: { ...state.input, budgetUsd } })),

        setTravelStyle: (travelStyle) =>
          set((state) => ({ input: { ...state.input, travelStyle } })),

        setTrekkingLevel: (trekkingLevel) =>
          set((state) => ({ input: { ...state.input, trekkingLevel } })),

        toggleInterest: (interest) =>
          set((state) => {
            const interests = state.input.interests.includes(interest)
              ? state.input.interests.filter((i) => i !== interest)
              : [...state.input.interests, interest];
            return { input: { ...state.input, interests } };
          }),

        setCurrentStep: (currentStep) => set({ currentStep }),
        setActiveDay: (activeDay) => set({ activeDay }),
        setGenerating: (isGenerating) => set({ isGenerating }),
        setItinerary: (itinerary) => set({ itinerary }),
        appendStreamingText: (text) =>
          set((state) => ({ streamingText: state.streamingText + text })),
        clearStreamingText: () => set({ streamingText: "" }),
        setError: (error) => set({ error }),

        reset: () =>
          set({
            input: defaultInput,
            isGenerating: false,
            itinerary: null,
            streamingText: "",
            error: null,
            currentStep: 0,
            activeDay: 1,
          }),
      }),
      {
        name: "hidden-nepal-planner",
        // Only persist the input, not generation state
        partialize: (state) => ({ input: state.input }),
      }
    )
  )
);
