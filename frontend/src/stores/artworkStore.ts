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
      const occupiedMountPointIds = state.artworks
        .filter((artwork) => artwork.roomId === roomId && artwork.id !== artworkId)
        .map((artwork) => {
          const matched = targetRoom.mountPoints.find(
            (point) =>
              point.position.x === artwork.mountPosition.x &&
              point.position.y === artwork.mountPosition.y &&
              point.position.z === artwork.mountPosition.z,
          );
          return matched?.id;
        })
        .filter(Boolean);
      const availableMountPoint = targetRoom.mountPoints.find(
        (point) => !occupiedMountPointIds.includes(point.id),
      );
      const mountPoint = availableMountPoint ?? targetRoom.mountPoints[0];
      if (!mountPoint) {
        return state;
      }
      const originalArtwork = state.artworks.find((a) => a.id === artworkId);
      const mountPosition = mountPoint.position ?? originalArtwork?.mountPosition;
      const rotationY = mountPoint.rotationY ?? originalArtwork?.rotationY ?? 0;
      return {
        artworks: state.artworks.map((artwork) =>
          artwork.id === artworkId ? { ...artwork, roomId, mountPosition, rotationY } : artwork,
        ),
      };
    }),
}));
