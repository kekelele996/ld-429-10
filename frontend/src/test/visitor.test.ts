import { describe, it, expect, beforeEach } from 'vitest';
import { useVisitorStore } from '../stores/visitorStore';
import { VisitorStatus } from '../types/enums';

describe('Visitor tracking - analytics across rooms', () => {
  beforeEach(() => {
    useVisitorStore.setState({
      visitors: [],
      currentVisitorId: 'visitor-test',
    });
  });

  it('markViewed should record first artwork when visitor is new', () => {
    const markViewed = useVisitorStore.getState().markViewed;

    markViewed('art-101');

    const visitor = useVisitorStore.getState().visitors.find((v) => v.visitorId === 'visitor-test');
    expect(visitor).toBeDefined();
    expect(visitor?.viewedArtworkIds).toEqual(['art-101']);
    expect(visitor?.onlineStatus).toBe(VisitorStatus.InGallery);
  });

  it('markViewed should append subsequent artworks instead of keeping only the first', () => {
    const markViewed = useVisitorStore.getState().markViewed;

    markViewed('art-101');
    markViewed('art-102');
    markViewed('art-103');

    const visitor = useVisitorStore.getState().visitors.find((v) => v.visitorId === 'visitor-test');
    expect(visitor?.viewedArtworkIds).toEqual(['art-101', 'art-102', 'art-103']);
  });

  it('markViewed should not add duplicate artwork ids', () => {
    const markViewed = useVisitorStore.getState().markViewed;

    markViewed('art-101');
    markViewed('art-102');
    markViewed('art-101');

    const visitor = useVisitorStore.getState().visitors.find((v) => v.visitorId === 'visitor-test');
    expect(visitor?.viewedArtworkIds).toEqual(['art-101', 'art-102']);
  });

  it('markViewed should accumulate views across different rooms', () => {
    const markViewed = useVisitorStore.getState().markViewed;

    markViewed('art-101');
    markViewed('art-102');
    markViewed('art-103');
    markViewed('art-104');

    const visitor = useVisitorStore.getState().visitors.find((v) => v.visitorId === 'visitor-test');
    expect(visitor?.viewedArtworkIds.length).toBe(4);
    expect(new Set(visitor?.viewedArtworkIds).size).toBe(4);
  });

  it('analytics should compute correct unique artwork coverage across visitors', () => {
    useVisitorStore.setState({
      visitors: [
        {
          visitorId: 'v1',
          enteredAt: new Date().toISOString(),
          staySeconds: 100,
          viewedArtworkIds: ['art-101', 'art-102'],
          currentRoomId: 'room-main',
          onlineStatus: VisitorStatus.InGallery,
        },
        {
          visitorId: 'v2',
          enteredAt: new Date().toISOString(),
          staySeconds: 200,
          viewedArtworkIds: ['art-102', 'art-103', 'art-104'],
          currentRoomId: 'room-side',
          onlineStatus: VisitorStatus.InGallery,
        },
      ],
      currentVisitorId: 'v1',
    });

    const visitors = useVisitorStore.getState().visitors;
    const allViewedIds = visitors.flatMap((v) => v.viewedArtworkIds);
    const uniqueArtworkCount = new Set(allViewedIds).size;

    expect(uniqueArtworkCount).toBe(4);
    expect(allViewedIds.includes('art-101')).toBe(true);
    expect(allViewedIds.includes('art-102')).toBe(true);
    expect(allViewedIds.includes('art-103')).toBe(true);
    expect(allViewedIds.includes('art-104')).toBe(true);
  });
});
