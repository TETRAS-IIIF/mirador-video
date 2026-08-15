import { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@tests/utils/test-utils';
import { VideoViewer } from '../../../src/components/VideoViewer';

const { mockGetInternalPlayer, mockSeekTo } = vi.hoisted(() => ({
  mockGetInternalPlayer: vi.fn(() => ({})),
  mockSeekTo: vi.fn(),
}));

vi.mock('@celluloid/react-player', () => {
  /** Stub replacing the real player so tests don't depend on real media playback. */
  const MockReactPlayer = forwardRef(({ url }, ref) => {
    useImperativeHandle(ref, () => ({
      getInternalPlayer: mockGetInternalPlayer,
      seekTo: mockSeekTo,
    }));
    return <div data-testid="react-player" data-url={url} />;
  });
  MockReactPlayer.propTypes = { url: PropTypes.string.isRequired };
  MockReactPlayer.displayName = 'MockReactPlayer';
  return { default: MockReactPlayer };
});

vi.mock('react-resize-observer', () => ({ default: () => null }));

vi.mock('../../../src/containers/AnnotationsOverlayVideo', () => ({
  default: () => <div data-testid="annotations-overlay-video-mock" />,
}));

vi.mock('../../../src/containers/WindowCanvasNavigationControlsVideo', () => ({
  default: () => <div data-testid="window-canvas-navigation-controls-video-mock" />,
}));

/** Builds a stub canvas exposing only what VideoViewer reads from it. */
function buildCanvas(annotations = [], duration = 0) {
  return {
    getContent: () => annotations,
    getDuration: () => duration,
  };
}

/** Builds a stub annotation with a Video body, optionally restricted to a temporal fragment. */
function buildVideoAnnotation({ start, end, id = 'https://example.org/video.mp4', width = 640, height = 480 } = {}) {
  const fragment = typeof start === 'number' ? `#t=${start}${typeof end === 'number' ? `,${end}` : ''}` : '';
  return {
    __jsonld: { target: `https://example.org/canvas1${fragment}` },
    getBody: () => [
      {
        __jsonld: { id, type: 'Video' },
        getHeight: () => height,
        getWidth: () => width,
        id,
      },
    ],
  };
}

/** create wrapper */
function createWrapper(props) {
  return render(<VideoViewer debug={false} setSeekTo={() => {}} windowId="window1" {...props} />);
}

describe('VideoViewer', () => {
  beforeEach(() => {
    mockSeekTo.mockClear();
  });

  describe('render', () => {
    it('renders nothing when the canvas has no video content', () => {
      createWrapper({ canvas: buildCanvas([]) });

      expect(screen.queryByTestId('react-player')).not.toBeInTheDocument();
    });

    it('renders the player for the canvas video resource', () => {
      createWrapper({ canvas: buildCanvas([buildVideoAnnotation()]) });

      expect(screen.getByTestId('react-player')).toHaveAttribute('data-url', 'https://example.org/video.mp4');
    });

    it('does not render a player when currentTime falls outside the annotation temporal fragment', () => {
      createWrapper({
        canvas: buildCanvas([buildVideoAnnotation({ end: 200, start: 100 })]),
        currentTime: 0,
      });

      expect(screen.queryByTestId('react-player')).not.toBeInTheDocument();
    });
  });

  describe('componentDidUpdate', () => {
    it('does not crash seeking when currentTime changes while no player is mounted', () => {
      const canvas = buildCanvas([buildVideoAnnotation({ end: 200, start: 100 })]);
      const { rerender } = createWrapper({ canvas, currentTime: 0, paused: true });

      expect(screen.queryByTestId('react-player')).not.toBeInTheDocument();

      expect(() =>
        rerender(<VideoViewer canvas={canvas} currentTime={5} debug={false} paused setSeekTo={() => {}} windowId="window1" />),
      ).not.toThrow();
    });

    it('seeks the mounted player when currentTime changes while paused', () => {
      const canvas = buildCanvas([buildVideoAnnotation()]);
      const { rerender } = createWrapper({ canvas, currentTime: 0, paused: true });

      rerender(<VideoViewer canvas={canvas} currentTime={5} debug={false} paused setSeekTo={() => {}} windowId="window1" />);

      expect(mockSeekTo).toHaveBeenCalledWith(5);
    });
  });
});
