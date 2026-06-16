import { describe, it, expect, beforeEach } from 'vitest';
import { useRoomStore } from '../stores/roomStore';
import { useArtworkStore } from '../stores/artworkStore';
import { rooms, artworks } from '../api/mockGallery';

describe('Gallery scene - room switching', () => {
  beforeEach(() => {
    useRoomStore.setState({
      rooms,
      selectedRoomId: 'room-main',
    });
    useArtworkStore.setState({
      artworks,
    });
  });

  it('should select main room when selectedRoomId is room-main', () => {
    const selectedRoomId = useRoomStore.getState().selectedRoomId;
    const allRooms = useRoomStore.getState().rooms;
    const selectedRoom = allRooms.find((r) => r.id === selectedRoomId);

    expect(selectedRoomId).toBe('room-main');
    expect(selectedRoom).toBeDefined();
    expect(selectedRoom?.id).toBe('room-main');
    expect(selectedRoom?.name).toBe('主展厅：纸上城市');
  });

  it('should filter artworks by selected room', () => {
    const allRooms = useRoomStore.getState().rooms;

    rooms.forEach((room) => {
      useRoomStore.getState().selectRoom(room.id);
      const selectedRoomId = useRoomStore.getState().selectedRoomId;
      const allArtworks = useArtworkStore.getState().artworks;
      const filteredArtworks = allArtworks.filter((a) => a.roomId === selectedRoomId);

      expect(selectedRoomId).toBe(room.id);
      filteredArtworks.forEach((artwork) => {
        expect(artwork.roomId).toBe(room.id);
      });

      const currentRoom = allRooms.find((r) => r.id === selectedRoomId);
      filteredArtworks.forEach((artwork) => {
        const mountPointMatch = currentRoom?.mountPoints.find(
          (mp) =>
            mp.position.x === artwork.mountPosition.x &&
            mp.position.y === artwork.mountPosition.y &&
            mp.position.z === artwork.mountPosition.z,
        );
        expect(mountPointMatch).toBeDefined();
        expect(artwork.rotationY).toBe(mountPointMatch?.rotationY);
      });
    });
  });

  it('selectedRoomId should change correctly when switching rooms', () => {
    const selectRoom = useRoomStore.getState().selectRoom;

    selectRoom('room-side');
    expect(useRoomStore.getState().selectedRoomId).toBe('room-side');

    selectRoom('room-virtual');
    expect(useRoomStore.getState().selectedRoomId).toBe('room-virtual');

    selectRoom('room-main');
    expect(useRoomStore.getState().selectedRoomId).toBe('room-main');
  });
});
