import { render, screen } from '@tests/utils/test-utils';
import { Utils } from 'manifesto.js';
import AnnotationFactory from '../../../src/lib/AnnotationFactory';
import { VideoViewer } from '../../../src/components/VideoViewer';

/** create wrapper */
function createWrapper(props, suspenseFallback) {
  return render(
    <VideoViewer
      classes={{}}
      videoOptions={{ crossOrigin: 'anonymous' }}
      {...props}
    />,
  );
}

// TODO enable these tests again when video support is added back to Mirador core
describe('VideoViewer', () => {
  let wrapper;
  describe('render', () => {
    it.skip('video', () => {
      wrapper = createWrapper({
        canvas: Utils.parseManifest(videoSimple).getSequences()[0].getCanvases()[0],
      }, true);
      expect(wrapper.exists('video[crossOrigin="anonymous"]')).toBe(true); // eslint-disable-line jsx-a11y/media-has-caption
      expect(wrapper.contains(<source src="https://fixtures.iiif.io/video/indiana/30-minute-clock/medium/30-minute-clock.mp4" type="video/mp4" />)).toBe(true);
    });
    it.skip('one caption', () => {
      const canvas = Utils.parseManifest(videoCaptions).getSequences()[0].getCanvases()[0];
      /* cf selectors/annotations/getPresentAnnotationsCanvas */
      const annotations = canvas.__jsonld.annotations.flatMap((a) => AnnotationFactory.determineAnnotation(a));
      wrapper = createWrapper({
        annotations,
        canvas,
      }, true);
      expect(wrapper.contains(<track src="https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt" srcLang="en" />)).toBe(true);
      expect(wrapper.exists('video[crossOrigin="anonymous"]')).toBe(true); // eslint-disable-line jsx-a11y/media-has-caption
    });
    it.skip('multiples captions', () => {
      const canvas = Utils.parseManifest(videoMultiCaptions).getSequences()[0].getCanvases()[0];
      /* cf selectors/annotations/getPresentAnnotationsCanvas */
      const annotations = canvas.__jsonld.annotations.flatMap((a) => AnnotationFactory.determineAnnotation(a));
      wrapper = createWrapper({
        annotations,
        canvas,
      }, true);
      expect(wrapper.contains(<track src="https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt#en" srcLang="en" />)).toBe(true);
      expect(wrapper.contains(<track src="https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt#fr" srcLang="fr" />)).toBe(true);
      expect(wrapper.exists('video[crossOrigin="anonymous"]')).toBe(true); // eslint-disable-line jsx-a11y/media-has-caption
    });
    it.skip('multiples captions in multiples annotations', () => {
      const canvas = Utils.parseManifest(videoMultiCaptionsMultiAnno).getSequences()[0].getCanvases()[0];
      /* cf selectors/annotations/getPresentAnnotationsCanvas */
      const annotations = canvas.__jsonld.annotations.flatMap((a) => AnnotationFactory.determineAnnotation(a));
      wrapper = createWrapper({
        annotations,
        canvas,
      }, true);
      expect(wrapper.contains(<track src="https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt#en" srcLang="en" />)).toBe(true);
      expect(wrapper.contains(<track src="https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt#fr" srcLang="fr" />)).toBe(true);
      expect(wrapper.contains(<track src="https://fixtures.iiif.io/video/indiana/lunchroom_manners/lunchroom_manners.vtt#ru" srcLang="ru" />)).toBe(true);
      expect(wrapper.exists('video[crossOrigin="anonymous"]')).toBe(true); // eslint-disable-line jsx-a11y/media-has-caption
    });
  });
});
