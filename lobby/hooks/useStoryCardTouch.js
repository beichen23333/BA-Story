import { useCallback, useEffect, useRef, useState } from "react";

export function useStoryCardTouch(onSelect, onClickSound, duration = 440) {
    const [bouncingItem, setBouncingItem] = useState(null);
    const locked = useRef(false);
    const timer = useRef(null);

    useEffect(() => () => {
        if (timer.current) window.clearTimeout(timer.current);
    }, []);

    const trigger = useCallback((item) => {
        if (locked.current) return;
        locked.current = true;
        onClickSound?.();
        setBouncingItem(item);
        timer.current = window.setTimeout(() => {
            timer.current = null;
            setBouncingItem(null);
            locked.current = false;
            onSelect?.(item);
        }, duration);
    }, [duration, onClickSound, onSelect]);

    const handleKeyDown = useCallback((event, item) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            trigger(item);
        }
    }, [trigger]);

    const isBouncing = useCallback((item) => bouncingItem === item, [bouncingItem]);

    return { trigger, handleKeyDown, isBouncing };
}
