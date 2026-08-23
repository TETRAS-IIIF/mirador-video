import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import * as ResizeObserverModule from 'react-resize-observer';
import ViewerInfo from '../containers/ViewerInfo';
import ViewerNavigation from '../containers/ViewerNavigation';
import ViewerNavigationVideo from '../containers/ViewerNavigationVideo';
import ns from '../config/css-ns';
import { PluginHook } from './PluginHook';
import unwrapDefault from '../lib/unwrapDefault';

// Some bundler/CJS-interop combinations (notably esbuild's dependency
// pre-bundling in Vite dev mode) leave this double-wrapped as
// { default: { default: Component } } instead of unwrapping to Component.
const ResizeObserver = unwrapDefault(ResizeObserverModule);

/**
 * WindowCanvasNavigationControlsVideo - based on WindowCanvasNavigationControls
 * Represents the viewer controls in the mirador workspace.
 */
export class WindowCanvasNavigationControlsVideo extends Component {
  /** */
  constructor(props) {
    super(props);
    this.state = { size: {} };
  }

  /**
   * Determine if canvasNavControls are stacked (based on a hard-coded width)
   */
  canvasNavControlsAreStacked() {
    const { size } = this.state;

    return size && size.width && size.width <= 253;
  }

  /** */
  setSize = (size) => {
    this.setState({ size });
  };

  /** */
  render() {
    const { classes, visible, windowId, setPaused } = this.props;

    return (
      <Paper
        square
        className={classNames(
          ns('canvas-nav'),
          this.canvasNavControlsAreStacked() ? ns('canvas-nav-stacked') : null,
          this.canvasNavControlsAreStacked() ? classes.canvasNavStacked : null,
        )}
        elevation={0}
        sx={(theme) => ({
          backgroundColor: theme.palette.background.paper,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'absolute',
          textAlign: 'center',
          width: '100%',
          zIndex: 50,
        })}
      >
        <ResizeObserver onResize={this.setSize} />
        <ViewerNavigation windowId={windowId} beforeClick={setPaused} />
        <ViewerInfo windowId={windowId} />
        <ViewerNavigationVideo windowId={windowId} />

        <PluginHook {...this.props} size={this.state.size} />
      </Paper>
    );
  }
}

WindowCanvasNavigationControlsVideo.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string),
  setPaused: PropTypes.func,
  visible: PropTypes.bool,
  windowId: PropTypes.string.isRequired,
};

WindowCanvasNavigationControlsVideo.defaultProps = {
  classes: {},
  setPaused: () => {},
  visible: true,
};
