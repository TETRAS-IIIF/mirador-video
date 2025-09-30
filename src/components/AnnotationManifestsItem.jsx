import { Component } from 'react';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import {
  Card, CardActionArea, CardActions, CardContent, CardMedia,
} from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

/**
 * AnnotationManifestsItem
 */
export class AnnotationManifestsItem extends Component {
  /**
   * constructor
   */
  constructor(props) {
    super(props);
    this.handleOpenManifestSideToSide = this.handleOpenManifestSideToSide.bind(this);
  }

  /** */
  componentDidMount() {
    const {
      // eslint-disable-next-line react/prop-types
      fetchManifest, manifestId, ready, isFetching, error, provider,
    } = this.props;

    if (!ready && !error && !isFetching && provider !== 'file') {
      fetchManifest(manifestId);
    }
  }

  /** */
  handleOpenManifestSideToSide(e, manifestId) {
    // eslint-disable-next-line react/prop-types
    const { addResource, addWindow } = this.props;
    addResource(manifestId);
    addWindow({ manifestId });
  }

  /** */
  render() {
    const {
      // eslint-disable-next-line react/prop-types
      t, manifestId, thumbnail, title, description, error, ready,
    } = this.props;

    if (error) {
      return (
        <Typography sx={theme => ({ color: theme.palette.error.main })}>{t('resourceError', { manifestId })}</Typography>
      );
    }

    if (!ready) {
      return (
        <Typography>
          <Typography>{t('resourceLoading')}</Typography>
        </Typography>
      );
    }

    return (
      <Card>
        <CardActionArea>
          {
            thumbnail && (
              <CardMedia
                sx={{
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
                component="img"
                height="140"
                image={thumbnail}
                alt="green iguana"
              />
            )
          }
          <CardContent>
            <Typography>
              { title || manifestId }
            </Typography>
            {
              description && (
                <Typography>
                  { description }
                </Typography>
              )
            }
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Tooltip title={t('openManifestInOtherWindow', { manifestId })}>
            <Button
              size="small"
              color="primary"
              onClick={(e) => {
                this.handleOpenManifestSideToSide(e, manifestId);
              }}
            >
              {t('open')}
            </Button>
          </Tooltip>
        </CardActions>
      </Card>
    );
  }
}

AnnotationManifestsItem.propsTypes = {
  addResource: PropTypes.func.isRequired,
  addWindow: PropTypes.func.isRequired,
  classes: PropTypes.objectOf(PropTypes.string),
  description: PropTypes.string,
  error: PropTypes.string,
  fetchManifest: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  manifestLogo: PropTypes.string,
  manifests: PropTypes.arrayOf(PropTypes.string),
  provider: PropTypes.string,
  ready: PropTypes.bool,
  t: PropTypes.func.isRequired,
  thumbnail: PropTypes.string,
  title: PropTypes.string,
};

AnnotationManifestsItem.defaultProps = {
  classes: {},
  error: null,
  isFetching: false,
  manifestLogo: null,
  provider: null,
  ready: false,
  thumbnail: null,
  title: null,
};
