import { create } from 'zustand';

interface PwaState {
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  isInstallable: boolean;
  setIsInstallable: (val: boolean) => void;
  forceShowPrompt: boolean;
  setForceShowPrompt: (val: boolean) => void;
}

export const usePwaStore = create<PwaState>((set) => ({
  deferredPrompt: null,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  isInstallable: false,
  setIsInstallable: (val) => set({ isInstallable: val }),
  forceShowPrompt: false,
  setForceShowPrompt: (val) => set({ forceShowPrompt: val }),
}));
