import { create } from 'zustand';
import type { Artwork } from '../types';
import { artworks, rooms } from '../api/mockGallery';

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
    set((state) => {
      const targetRoom = rooms.find((room) => room.id === roomId);
      if (!targetRoom) {
        return state;
      }
      const occupiedPositions = state.artworks
        .filter((artwork) => artwork.roomId === roomId && artwork.id !== artworkId)
        .map((artwork) => JSON.stringify(artwork.mountPosition));
      const availableMountPoint = targetRoom.mountPoints.find(
        (point) => !occupiedPositions.includes(JSON.stringify(point.position)),
      );
      const mountPosition = availableMountPoint?.position ?? targetRoom.mountPoints[0]?.position ?? state.artworks.find((a) => a.id === artworkId)?.mountPosition;
      return {
        artworks: state.artworks.map((artwork) => (artwork.id === artworkId ? { ...artwork, roomId, mountPosition } : artwork)),
      };
    }),
}));
