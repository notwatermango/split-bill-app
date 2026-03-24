import { useRef, useCallback } from "react";

const LONG_PRESS_DURATION = 500;

/**
 * Returns touch event handlers that fire a callback after a long press.
 * Cancels on touchmove (scroll) or touchend before the threshold.
 */
export function useLongPress<T = string>(
    onLongPress: (id: T) => void,
    duration = LONG_PRESS_DURATION,
) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const movedRef = useRef(false);

    const start = useCallback(
        (id: T) => (e: React.TouchEvent) => {
            e.preventDefault(); // prevent text selection on long press
            movedRef.current = false;
            timerRef.current = setTimeout(() => {
                if (!movedRef.current) {
                    onLongPress(id);
                }
            }, duration);
        },
        [onLongPress, duration],
    );

    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const move = useCallback(() => {
        movedRef.current = true;
        cancel();
    }, [cancel]);

    return { start, cancel, move };
}
