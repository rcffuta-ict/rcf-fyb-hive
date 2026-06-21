import { getTheme, paletteToCss } from "@/config/themes";
import { site } from "@/config/site";

type ThemeProviderProps = {
    children: React.ReactNode;
};

/**
 * Server component: injects the active palette (from `site.theme`) as an inline
 * <style> before paint, so the whole app is skinned with zero flash and no
 * client JavaScript. Swap the look by changing `theme` in site.config.json or
 * by adding a palette in src/config/themes.ts.
 */
const ThemeProvider = ({ children }: ThemeProviderProps): React.JSX.Element => {
    const css = paletteToCss(getTheme(site.theme));

    return (
        <>
            <style
                id="fyb-theme"
                dangerouslySetInnerHTML={{ __html: css }}
            />
            {children}
        </>
    );
};

export default ThemeProvider;
