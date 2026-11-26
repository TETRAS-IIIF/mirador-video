import { render } from '@tests/utils/test-utils';
import { AnnotationsOverlayVideo } from '../../../src/components/AnnotationsOverlayVideo';
import CanvasWorld from '../../../src/lib/CanvasWorld';
import AnnotationResource from '../../../src/lib/AnnotationResource';
import AnnotationItem from '../../../src/lib/AnnotationItem';

vi.mock('../../../src/lib/CanvasOverlayVideo', () => ({
  default: class MockCanvasOverlayVideo {
    constructor() {
      this.canvas = null;
    }
  },
}));

/** create wrapper */
function createWrapper(props) {
  const canvasWorld = new CanvasWorld([]);
  canvasWorld.canvasToWorldCoordinates = vi.fn(() => [0, 0, 100, 100]);

  return render(
    <AnnotationsOverlayVideo
      canvas={{ id: 'canvas1' }}
      canvasWorld={canvasWorld}
      debug={false}
      iiifVideoInfos={{}}
      onFunctionsReady={() => {}}
      playerRef={{}}
      videoRef={document.createElement('video')}
      windowId="window1"
      {...props}
    />,
  );
}

describe('AnnotationsOverlayVideo', () => {
  it('removes every video event listener it registered on mount, using the same handler reference, when it unmounts', () => {
    const videoRef = document.createElement('video');
    const addSpy = vi.spyOn(videoRef, 'addEventListener');
    const removeSpy = vi.spyOn(videoRef, 'removeEventListener');

    const { unmount } = createWrapper({ videoRef });

    const addedListeners = addSpy.mock.calls.map(([type, handler]) => ({ handler, type }));
    expect(addedListeners.length).toBeGreaterThan(0);

    unmount();

    addedListeners.forEach(({ type, handler }) => {
      expect(removeSpy).toHaveBeenCalledWith(type, handler);
    });
  });

  describe('isAnnotationAtPoint (click hit-test)', () => {
    /** An overlay whose canvas sits at world x=50, with a stub 2D context. */
    function overlay(isPointInPath = vi.fn(() => true)) {
      const canvasWorld = new CanvasWorld([]);
      canvasWorld.canvasToWorldCoordinates = vi.fn(() => [50, 0, 640, 480]);
      const instance = new AnnotationsOverlayVideo({ canvasWorld, onFunctionsReady: () => {}, windowId: 'window1' });
      instance.canvasOverlay = { context2d: { isPointInPath } };
      return { instance, isPointInPath };
    }
    // W3C annotations, as MAEV saves them.
    const svgResource = (shape) =>
      new AnnotationItem({
        id: 'anno-svg',
        target: {
          selector: [{ type: 'SvgSelector', value: `<svg xmlns="http://www.w3.org/2000/svg">${shape}</svg>` }],
          source: 'canvas1',
        },
        type: 'Annotation',
      });

    it('finds a click inside a rectangle given as xywh, and not outside it', () => {
      const { instance } = overlay();
      const rectangle = new AnnotationResource({ '@id': 'anno-rect', on: 'canvas1#xywh=10,20,100,50' });
      const canvas = { id: 'canvas1' };

      // Points are in world coordinates: the canvas starts at x=50.
      expect(instance.isAnnotationAtPoint(rectangle, canvas, { x: 50 + 60, y: 40 })).toBe(true);
      expect(instance.isAnnotationAtPoint(rectangle, canvas, { x: 50 + 5, y: 40 })).toBe(false);
      expect(instance.isAnnotationAtPoint(rectangle, canvas, { x: 50 + 60, y: 80 })).toBe(false);
    });

    it('finds a click inside a W3C rectangle with a time range, only during that time', () => {
      const { instance } = overlay();
      const rectangle = new AnnotationItem({
        id: 'anno-rect-time',
        target: { selector: { type: 'FragmentSelector', value: 'xywh=10,20,100,50&t=5,30' }, source: 'canvas1' },
        type: 'Annotation',
      });
      const canvas = { id: 'canvas1' };

      expect(instance.isAnnotationAtPoint(rectangle, canvas, { x: 50 + 60, y: 40 }, 10)).toBe(true);
      expect(instance.isAnnotationAtPoint(rectangle, canvas, { x: 50 + 5, y: 40 }, 10)).toBe(false);
      expect(instance.isAnnotationAtPoint(rectangle, canvas, { x: 50 + 60, y: 40 }, 40)).toBe(false);
    });

    it.each([
      ['rect', '<rect x="10" y="20" width="100" height="50"/>'],
      ['circle', '<circle cx="60" cy="40" r="20"/>'],
      ['polygon', '<polygon points="10,20 110,20 60,70"/>'],
      ['path', '<path d="M10 20 L110 20 L60 70 Z"/>'],
    ])('hit-tests an SVG <%s> without throwing, in canvas coordinates', (_name, shape) => {
      const { instance, isPointInPath } = overlay();

      expect(instance.isAnnotationAtPoint(svgResource(shape), { id: 'canvas1' }, { x: 50 + 60, y: 40 })).toBe(true);
      expect(isPointInPath).toHaveBeenCalledWith(expect.any(Path2D), 60, 40);
    });

    it('misses an SVG shape when the context says the point is outside', () => {
      const { instance } = overlay(vi.fn(() => false));

      expect(
        instance.isAnnotationAtPoint(
          svgResource('<rect x="10" y="20" width="100" height="50"/>'),
          { id: 'canvas1' },
          { x: 0, y: 0 },
        ),
      ).toBe(false);
    });
  });
});
