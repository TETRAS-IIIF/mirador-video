import { render } from '@tests/utils/test-utils';
import { WindowCanvasNavigationControlsVideo } from '../../../src/components/WindowCanvasNavigationControlsVideo';
import ns from '../../../src/config/css-ns';

vi.mock('../../../src/containers/ViewerInfo', () => ({ default: () => null }));
vi.mock('../../../src/containers/ViewerNavigation', () => ({ default: () => null }));
vi.mock('../../../src/containers/ViewerNavigationVideo', () => ({ default: () => null }));

const stackedClass = ns('canvas-nav-stacked');

/** create wrapper */
function createWrapper(props) {
  return render(<WindowCanvasNavigationControlsVideo windowId="window1" {...props} />);
}

describe('WindowCanvasNavigationControlsVideo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stacks the controls when it measures its own container as narrower than the breakpoint', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ height: 40, width: 200 });

    const { container } = createWrapper();

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector(`.${stackedClass}`)).toBeInTheDocument();
  });

  it('does not stack the controls when it measures its own container as wider than the breakpoint', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ height: 40, width: 400 });

    const { container } = createWrapper();

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    expect(container.querySelector(`.${stackedClass}`)).not.toBeInTheDocument();
  });
});
