/**
 * CanvasAnnotationDisplay - class used to display a SVG and fragment based
 * annotations.
 */
import { buildPath2D, svgShapeElements } from '../lib/svgShapesToPath';

export default class CanvasAnnotationDisplay {
  /**
   * `canvasWorld` and `overlayScale` come from the image viewer. The video
   * overlay has neither: it passes `offset`, `zoomRatio`, the canvas size
   * (`canvasSize`, used when the annotation has no selector) and an optional
   * `imageSource` drawn into the fragment.
   */
  constructor({
    resource,
    palette,
    canvasWorld,
    overlayScale,
    selected,
    hovered,
    zoomRatio,
    offset,
    imageSource,
    canvasSize,
    draft = false,
  }) {
    this.resource = resource;
    this.palette = palette;
    this.canvasWorld = canvasWorld;
    this.selected = selected;
    this.hovered = hovered;
    this.overlayScale = overlayScale;
    // these variables have to be kept for plugins
    this.zoomRatio = zoomRatio;
    this.offset = offset || this.canvasWorld?.offsetByCanvas(this.resource.targetId) || { x: 0, y: 0 };
    this.imageSource = imageSource;
    this.canvasSize = canvasSize;
    this.draft = draft;
  }

  /** Draft palette, when this annotation is a draft and the palette has one. */
  get draftPalette() {
    return this.draft && this.palette.draft ? this.palette.draft : null;
  }

  /** Applies a palette's dash pattern, scaled like the line width. */
  applyLineDash(currentPalette, scale = 1) {
    if (Array.isArray(currentPalette.lineDash) && this.context.setLineDash) {
      this.context.setLineDash(currentPalette.lineDash.map((n) => n * scale));
    }
  }

  /** */
  toContext(context) {
    this.context = context;
    if (this.resource.svgSelector) {
      this.svgContext();
    } else if (this.resource.fragmentSelector || this.canvasSize) {
      this.fragmentContext();
    }
  }

  /** */
  get svgString() {
    return this.resource.svgSelector.value;
  }

  /**
   * Two scale factors compose here: `overlayScale` (screen pixels per OSD
   * viewport unit -- already applied to the context by
   * OpenSeadragonCanvasOverlay before toContext() runs) and `scale`
   * (native image pixels per CanvasWorld unit -- applied explicitly below
   * via context.scale()). Both apply automatically to drawn geometry, but
   * not to a plain lineWidth number -- lineWidthScale pre-divides that
   * back out so strokes render at their native width.
   * Without an overlayScale (video overlay), the zoomRatio plays that role.
   */
  get lineWidthScale() {
    const screenScale = this.overlayScale ?? this.zoomRatio ?? 1;
    return this.scale * screenScale || 1;
  }

  /** Native image pixels -> CanvasWorld world units, for this canvas. */
  get scale() {
    return this.canvasWorld ? this.canvasWorld.canvasScale(this.resource.targetId) : 1;
  }

  parseOpacity(value) {
    if (typeof value === 'string' && value.trim().endsWith('%')) {
      return parseFloat(value) / 100;
    }
    return parseFloat(value);
  }

  /** */
  svgContext() {
    let currentPalette;
    if (this.hovered) {
      currentPalette = this.palette.hovered;
    } else if (this.selected) {
      currentPalette = this.palette.selected;
    } else {
      currentPalette = this.draftPalette || this.palette.default;
    }

    if (currentPalette.globalAlpha === 0) return;

    [...this.svgPaths].forEach((element) => {
      /**
       *  Note: Path2D is not supported in IE11.
       *  TODO: Support multi canvas offset
       *  One example: https://developer.mozilla.org/en-US/docs/Web/API/Path2D/addPath
       */
      this.context.save();
      this.context.translate(this.offset.x, this.offset.y);
      this.context.scale(this.scale, this.scale);
      const p = buildPath2D(element);

      // Setup styling from SVG -> Canvas
      this.context.strokeStyle = this.color;
      if (element.getAttribute('stroke-dasharray')) {
        this.context.setLineDash(element.getAttribute('stroke-dasharray').split(','));
      }
      const svgToCanvasMap = {
        fill: 'fillStyle',
        stroke: 'strokeStyle',
        'stroke-dashoffset': 'lineDashOffset',
        'stroke-linecap': 'lineCap',
        'stroke-linejoin': 'lineJoin',
        'stroke-miterlimit': 'miterlimit',
        'stroke-width': 'lineWidth',
      };
      Object.keys(svgToCanvasMap).forEach((key) => {
        const value = element.getAttribute(key);
        if (!value) return;
        if (key === 'stroke-width') {
          // Units such as "2px" parse to 2; anything unparsable keeps the current width.
          const parsedStrokeWidth = Number.parseFloat(value);
          if (Number.isFinite(parsedStrokeWidth)) this.context.lineWidth = parsedStrokeWidth;
        } else {
          this.context[svgToCanvasMap[key]] = value;
        }
      });

      // Resize the stroke based off of the canvasScale * overlayScale
      this.context.lineWidth /= this.lineWidthScale;
      if (!Number.isFinite(this.context.lineWidth)) this.context.lineWidth = 1;

      // Reset the color if it is selected or hovered on, or a draft
      if (this.selected || this.hovered) {
        this.context.strokeStyle = currentPalette.strokeStyle || currentPalette.fillStyle;
      } else if (currentPalette === this.draftPalette) {
        this.context.strokeStyle = currentPalette.strokeStyle || this.context.strokeStyle;
        this.applyLineDash(currentPalette, 1 / this.lineWidthScale);
      }

      this.context.globalAlpha = currentPalette.globalAlpha;
      // Set the globalAlpha for fill, draw the fill and then update the globalAlpha for stroke
      if (element.getAttribute('fill') && element.getAttribute('fill') !== 'none') {
        if (element.getAttribute('fill-opacity')) {
          this.context.globalAlpha = currentPalette.globalAlpha * this.parseOpacity(element.getAttribute('fill-opacity'));
        }
        this.context.fill(p);
      }

      if (element.getAttribute('stroke-opacity')) {
        this.context.globalAlpha = currentPalette.globalAlpha * this.parseOpacity(element.getAttribute('stroke-opacity'));
      } else {
        this.context.globalAlpha = currentPalette.globalAlpha;
      }
      this.context.stroke(p);
      this.context.restore();
    });
  }

  /** */
  fragmentContext() {
    // Without a selector (video overlay), the annotation targets the whole
    // canvas. canvasSize is in world coordinates, offset included: the offset
    // is applied by translate() below, so draw from the canvas origin.
    const fragment = this.resource.fragmentSelector || (this.canvasSize && [0, 0, this.canvasSize[2], this.canvasSize[3]]);
    if (!fragment) return;

    let currentPalette;
    if (this.selected) {
      currentPalette = this.palette.selected;
    } else if (this.hovered) {
      currentPalette = this.palette.hovered;
    } else {
      currentPalette = this.draftPalette || this.palette.default;
    }

    this.context.save();
    Object.keys(currentPalette).forEach((key) => {
      if (key === 'lineDash') return;
      this.context[key] = currentPalette[key];
    });
    this.applyLineDash(currentPalette, 1 / this.lineWidthScale);

    if (currentPalette.globalAlpha === 0) return;
    this.context.translate(this.offset.x, this.offset.y);
    this.context.scale(this.scale, this.scale);

    if (currentPalette.fillStyle) {
      this.context.fillRect(...fragment);
    } else {
      this.context.lineWidth = 1 / this.lineWidthScale;
      this.context.strokeRect(...fragment);
    }

    if (this.imageSource) {
      this.context.drawImage(this.imageSource, ...fragment);
    }

    this.context.restore();
  }

  /** */
  get svgPaths() {
    return svgShapeElements(this.resource);
  }
}
