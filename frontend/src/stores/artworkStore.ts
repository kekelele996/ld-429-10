import { create } from 'zustand';
import type { Artwork } from '../types';
import { artworks } from '../api/mockGallery';

interface ArtworkState {
  artworks: Artwork[];
  activeArtworkId?: string;
  setActiveArtwork: (artworkId?: string) => void;
  moveArtwork: (artworkId: string, roomId: string) => void;
}

export const useArtworkStore = create<ArtworkState>((set) => ({
  artworks,
  activeArtworkId: artworks[0]?.id,
  setActiveArtwork: (artworkId) => set({ activeArtworkId: artworkId }),
  moveArtwork: (artworkId, roomId) =>
    set((state) => ({
      artworks: state.artworks.map((artwork) => (artwork.id === artworkId ? { ...artwork, roomId, mountPosition: { x: -6.8, y: 2.3, z: -5 } } : artwork)),
    })),
}));
