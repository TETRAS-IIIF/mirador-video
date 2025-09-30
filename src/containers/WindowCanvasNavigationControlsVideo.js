import { connect } from 'react-redux';
import { compose } from 'redux';
import { withPlugins } from '../extend/withPlugins';
import { getWorkspace } from '../state/selectors';
import { WindowCanvasNavigationControlsVideo } from '../components/WindowCanvasNavigationControlsVideo';
import * as actions from '../state/actions';

/** */
const mapStateToProps = (state, { windowId }) => ({
  visible: getWorkspace(state).focusedWindowId === windowId,
});

/** */
const mapDispatchToProps = (dispatch, { windowId }) => ({
  setPaused: (...args) => dispatch(actions.setWindowPaused(windowId, ...args)),
});

const enhance = compose(
  connect(mapStateToProps),
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('WindowCanvasNavigationControlsVideo'),
);

export default enhance(WindowCanvasNavigationControlsVideo);
