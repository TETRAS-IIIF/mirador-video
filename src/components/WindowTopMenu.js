import Menu from '@mui/material/Menu';
import ListSubheader from '@mui/material/ListSubheader';
import PropTypes from 'prop-types';
import WindowThumbnailSettings from '../containers/WindowThumbnailSettings';
import WindowViewSettings from '../containers/WindowViewSettings';
import { PluginHook } from './PluginHook';

/** Renders plugins */
function PluginHookWithHeader(props) {
  const { PluginComponents, t } = props; // eslint-disable-line react/prop-types
  return PluginComponents ? (
    <>
      <ListSubheader role="presentation" disableSticky tabIndex={-1}>{t('windowPluginButtons')}</ListSubheader>
      <PluginHook {...props} />
    </>
  ) : null;
}

/**
 */
export function WindowTopMenu({
  container = null, handleClose, showThumbnailNavigationSettings = true,
  toggleDraggingEnabled, windowId, anchorEl = null, open = false,
}) {
  const pluginProps = arguments[0]; // eslint-disable-line prefer-rest-params

  return (
    <Menu
      container={container?.current}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      onClose={handleClose}
      TransitionProps={{
        onEntering: toggleDraggingEnabled,
        onExit: toggleDraggingEnabled,
      }}
      orientation="horizontal"
      anchorEl={anchorEl}
      open={open}
    >
      <WindowViewSettings windowId={windowId} handleClose={handleClose} />
      {showThumbnailNavigationSettings
        && <WindowThumbnailSettings windowId={windowId} handleClose={handleClose} />}
      <PluginHookWithHeader {...pluginProps} />
    </Menu>
  );
}

WindowTopMenu.propTypes = {
  anchorEl: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  container: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  showThumbnailNavigationSettings: PropTypes.bool,
  toggleDraggingEnabled: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};
