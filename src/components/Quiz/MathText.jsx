// MathText.jsx - KaTeX lokal versiya
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathText({ children, className = "" }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !children) return;

        renderMath();
    }, [children]);

    const renderMath = () => {
        if (!containerRef.current || !children) return;

        try {
            let html = String(children);

            // Display mode formulalar: $$...$$
            html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula.trim(), {
                        throwOnError: false,
                        displayMode: true,
                        output: 'html'
                    });
                } catch (e) {
                    console.error('KaTeX render error (display):', e);
                    return match;
                }
            });

            // Inline mode formulalar: $...$
            html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula.trim(), {
                        throwOnError: false,
                        displayMode: false,
                        output: 'html'
                    });
                } catch (e) {
                    console.error('KaTeX render error (inline):', e);
                    return match;
                }
            });

            containerRef.current.innerHTML = html;
        } catch (e) {
            console.error('Math rendering error:', e);
            if (containerRef.current) {
                containerRef.current.innerHTML = children;
            }
        }
    };

    return <div ref={containerRef} className={className} />;
}

export default MathText;