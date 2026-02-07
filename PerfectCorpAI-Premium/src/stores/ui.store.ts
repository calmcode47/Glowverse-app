import { create } from 'zustand';
import type { ReactNode, ComponentType } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  component: ComponentType<any>;
  props?: any;
}

interface UIState {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  modals: Modal[];
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  isGlobalLoading: boolean;
  loadingMessage: string | null;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  bottomSheet: {
    isVisible: boolean;
    content: ReactNode | null;
    snapPoints?: string[];
  };
  showBottomSheet: (content: ReactNode, snapPoints?: string[]) => void;
  hideBottomSheet: () => void;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  showToast: (toast) => {
    const id = Date.now().toString();
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 3000 };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    if (newToast.duration) {
      setTimeout(() => {
        get().hideToast(id);
      }, newToast.duration);
    }
  },
  hideToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  modals: [],
  showModal: (modal) => {
    const id = Date.now().toString();
    set((state) => ({ modals: [...state.modals, { ...modal, id }] }));
  },
  hideModal: (id) => {
    set((state) => ({ modals: state.modals.filter((m) => m.id !== id) }));
  },
  hideAllModals: () => set({ modals: [] }),
  isGlobalLoading: false,
  loadingMessage: null,
  showLoading: (message) => {
    set({ isGlobalLoading: true, loadingMessage: message ?? null });
  },
  hideLoading: () => {
    set({ isGlobalLoading: false, loadingMessage: null });
  },
  bottomSheet: {
    isVisible: false,
    content: null,
    snapPoints: ['50%', '90%']
  },
  showBottomSheet: (content, snapPoints) => {
    set({
      bottomSheet: { isVisible: true, content, snapPoints: snapPoints ?? ['50%', '90%'] }
    });
  },
  hideBottomSheet: () => {
    set({
      bottomSheet: { isVisible: false, content: null, snapPoints: ['50%', '90%'] }
    });
  },
  isOnboardingComplete: false,
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode }))
}));
