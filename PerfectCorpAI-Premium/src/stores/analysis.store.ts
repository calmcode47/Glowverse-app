import { create } from 'zustand';
import { analysisApi, SkinAnalysisResult } from '@/services/api/analysis.api';

interface AnalysisState {
  analyses: SkinAnalysisResult[];
  currentAnalysis: SkinAnalysisResult | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  createAnalysis: (imageUri: string) => Promise<SkinAnalysisResult>;
  pollAnalysis: (id: string) => Promise<SkinAnalysisResult>;
  fetchAnalyses: (page?: number) => Promise<void>;
  fetchAnalysisById: (id: string) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  setCurrentAnalysis: (analysis: SkinAnalysisResult | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
  createAnalysis: async (imageUri: string) => {
    set({ isLoading: true, isProcessing: true, error: null });
    try {
      const { analysis } = await analysisApi.createAnalysis(imageUri);
      set({ currentAnalysis: analysis, isLoading: false });
      return analysis;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create analysis', isLoading: false, isProcessing: false });
      throw error;
    }
  },
  pollAnalysis: async (id: string) => {
    set({ isProcessing: true });
    try {
      const analysis = await analysisApi.pollAnalysis(id);
      set({ currentAnalysis: analysis, isProcessing: false });
      const analyses = get().analyses;
      const index = analyses.findIndex((a) => a.id === id);
      if (index !== -1) {
        analyses[index] = analysis;
      } else {
        analyses.unshift(analysis);
      }
      set({ analyses: [...analyses] });
      return analysis;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get analysis results', isProcessing: false });
      throw error;
    }
  },
  fetchAnalyses: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await analysisApi.listAnalyses({ page, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
      const newAnalyses = page === 1 ? response.data : [...get().analyses, ...response.data];
      set({
        analyses: newAnalyses,
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        hasMore: response.pagination.page < response.pagination.totalPages,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch analyses', isLoading: false });
    }
  },
  fetchAnalysisById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { analysis } = await analysisApi.getAnalysis(id);
      set({ currentAnalysis: analysis, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch analysis', isLoading: false });
    }
  },
  deleteAnalysis: async (id: string) => {
    try {
      await analysisApi.deleteAnalysis(id);
      set((state) => ({
        analyses: state.analyses.filter((a) => a.id !== id),
        currentAnalysis: state.currentAnalysis?.id === id ? null : state.currentAnalysis
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete analysis' });
      throw error;
    }
  },
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      analyses: [],
      currentAnalysis: null,
      isLoading: false,
      isProcessing: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    })
}));
