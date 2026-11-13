import { useEffect, useRef, useState } from "react";

const DEFAULT_TITLE_WIDTH = 300;
const EXPANSION_WIDTH_PX = 50;
const TABLE_BORDER_PX = 0.5;

export function calculateReportTitleWidth(
  availableWidthPx: number,
  rootFontSizePx: number,
  otherColumnWidths: number,
) {
  return Math.max(
    DEFAULT_TITLE_WIDTH,
    ((availableWidthPx - TABLE_BORDER_PX - EXPANSION_WIDTH_PX) /
      rootFontSizePx) *
      16 -
      otherColumnWidths,
  );
}

export function useReportTitleWidth(otherColumnWidths: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<{
    width: number;
    rootFontSize: number;
  }>();
  const [manualWidth, setManualWidth] = useState<number>();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const width = wrapper.getBoundingClientRect().width;
      const rootFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      if (width <= 0) return;
      setMeasurement((previous) =>
        previous?.width === width && previous.rootFontSize === rootFontSize
          ? previous
          : { width, rootFontSize },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return {
    wrapperRef,
    width:
      manualWidth ??
      (measurement
        ? calculateReportTitleWidth(
            measurement.width,
            measurement.rootFontSize,
            otherColumnWidths,
          )
        : DEFAULT_TITLE_WIDTH),
    onChange: setManualWidth,
  };
}
