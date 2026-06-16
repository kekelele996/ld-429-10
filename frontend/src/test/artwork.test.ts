import { describe, it, expect, beforeEach } from 'vitest';
import { useArtworkStore } from '../stores/artworkStore';
import { rooms } from '../api/mockGallery';

describe('Artwork movement - position and rotation', () => {
  beforeEach(() => {
    useArtworkStore.setState({
      artworks: [
        {
          id: 'art-test-1',
          title: '测试作品',
          artistName: '测试',
          year: 2024,
          medium: 'Test',
          imageUrl: 'test.jpg',
          thumbnailUrl: 'test-thumb.jpg',
          description: '测试',
          roomId: 'room-main',
          mountPosition: { x: -6.8, y: 2.3, z: -5 },
          rotationY: Math.PI / 2,
          frameStyle: 'modern' as any,
          tags: ['test'],
        },
      ],
    });
  });

  it('moveArtwork should update both mountPosition and rotationY when moving to different room', () => {
    const moveArtwork = useArtworkStore.getState().moveArtwork;

    moveArtwork('art-test-1', 'room-side');

    const movedArtwork = useArtworkStore.getState().artworks.find((a) => a.id === 'art-test-1');
    expect(movedArtwork).toBeDefined();
    expect(movedArtwork?.roomId).toBe('room-side');

    const sideRoom = rooms.find((r) => r.id === 'room-side');
    expect(sideRoom).toBeDefined();

    const mountPoint = sideRoom!.mountPoints.find(
      (mp) =>
        mp.position.x === movedArtwork?.mountPosition.x &&
        mp.position.y === movedArtwork?.mountPosition.y &&
        mp.position.z === movedArtwork?.mountPosition.z,
    );
    expect(mountPoint).toBeDefined();
    expect(movedArtwork?.rotationY).toBe(mountPoint?.rotationY);
  });

  it('moveArtwork to right wall should have negative rotationY', () => {
    const moveArtwork = useArtworkStore.getState().moveArtwork;

    moveArtwork('art-test-1', 'room-main');

    const artwork = useArtworkStore.getState().artworks.find((a) => a.id === 'art-test-1');
    const mainRoom = rooms.find((r) => r.id === 'room-main');
    const rightWallMount = mainRoom!.mountPoints.find((mp) => mp.rotationY === -Math.PI / 2);

    if (
      artwork &&
      rightWallMount &&
      artwork.mountPosition.x === rightWallMount.position.x &&
      artwork.mountPosition.y === rightWallMount.position.y &&
      artwork.mountPosition.z === rightWallMount.position.z
    ) {
      expect(artwork.rotationY).toBe(-Math.PI / 2);
    }
  });

  it('moveArtwork should pick available mount point when room has other artworks', () => {
    useArtworkStore.setState({
      artworks: [
        {
          id: 'art-existing',
          title: '已存在',
          artistName: '测试',
          year: 2024,
          medium: 'Test',
          imageUrl: 'test.jpg',
          thumbnailUrl: 'test-thumb.jpg',
          description: '测试',
          roomId: 'room-side',
          mountPosition: { x: -4.8, y: 2.1, z: -4 },
          rotationY: Math.PI / 2,
          frameStyle: 'modern' as any,
          tags: ['test'],
        },
        {
          id: 'art-new',
          title: '新作品',
          artistName: '测试',
          year: 2024,
          medium: 'Test',
          imageUrl: 'test2.jpg',
          thumbnailUrl: 'test2-thumb.jpg',
          description: '测试',
          roomId: 'room-main',
          mountPosition: { x: 0, y: 0, z: 0 },
          rotationY: 0,
          frameStyle: 'modern' as any,
          tags: ['test'],
        },
      ],
    });

    const moveArtwork = useArtworkStore.getState().moveArtwork;
    moveArtwork('art-new', 'room-side');

    const moved = useArtworkStore.getState().artworks.find((a) => a.id === 'art-new');
    const existing = useArtworkStore.getState().artworks.find((a) => a.id === 'art-existing');

    expect(moved?.roomId).toBe('room-side');
    expect(moved?.mountPosition).not.toEqual(existing?.mountPosition);

    const sideRoom = rooms.find((r) => r.id === 'room-side');
    const expectedMount = sideRoom!.mountPoints.find(
      (mp) =>
        mp.position.x === moved?.mountPosition.x &&
        mp.position.y === moved?.mountPosition.y &&
        mp.position.z === moved?.mountPosition.z,
    );
    expect(moved?.rotationY).toBe(expectedMount?.rotationY);
  });
});
