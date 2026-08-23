import { render } from '@tests/utils/test-utils';
import { AnnotationsOverlayVideo } from '../../../src/components/AnnotationsOverlayVideo';
import CanvasWorld from '../../../src/lib/CanvasWorld';

vi.mock('../../../src/lib/CanvasOverlayVideo', () => ({
  default: class MockCanvasOverlayVideo {
    constructor() {
      this.canvas = null;
    }
  },
}));

vi.mock('react-resize-observer', () => ({ default: () => null }));

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
});
