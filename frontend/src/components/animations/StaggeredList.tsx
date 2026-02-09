import React from 'react';
import ScrollReveal from './ScrollReveal';

interface StaggeredListProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    staggerDelay?: number;
    baseDelay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Renders a list with staggered scroll reveal animations
 * Perfect for Apple-style cascading animations
 */
export default function StaggeredList<T>({
    data,
    renderItem,
    staggerDelay = 100,
    baseDelay = 0,
    direction = 'up',
}: StaggeredListProps<T>) {
    return (
        <>
            {data.map((item, index) => (
                <ScrollReveal
                    key={index}
                    delay={baseDelay + index * staggerDelay}
                    direction={direction}
                    scale
                    springy
                >
                    {renderItem(item, index)}
                </ScrollReveal>
            ))}
        </>
    );
}
