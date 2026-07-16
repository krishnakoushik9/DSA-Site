/**
 * Details of the current device detection
 */
export const getDeviceDetails = () => {
    if (typeof window === 'undefined') {
        return { isMobile: false, isPhone: false, isTablet: false, userAgent: '' };
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    
    // 1. Android Tablet vs Phone
    // Android tablets typically do not contain the "Mobile" string in their user agent.
    const isAndroid = /Android/i.test(userAgent);
    const isAndroidPhone = isAndroid && /Mobile/i.test(userAgent);
    const isAndroidTablet = isAndroid && !/Mobile/i.test(userAgent);

    // 2. iOS iPad vs iPhone
    const isIPhone = /iPhone|iPod/i.test(userAgent);
    // Modern iPads request desktop version, presenting as Macintosh but with multi-touch support.
    const isIPad = /iPad/i.test(userAgent) || 
        (/Macintosh/i.test(userAgent) && maxTouchPoints > 0);

    // 3. Other mobile devices
    const isOtherMobileUA = /webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    const isPhone = isAndroidPhone || isIPhone || isOtherMobileUA;
    const isTablet = isAndroidTablet || isIPad;

    // Small screen check (usually phones, or portrait tablets)
    const isSmallScreen = window.innerWidth <= 768;

    // Mobile device is a phone, a tablet, or any device with a screen <= 768px
    const isMobileDevice = isPhone || isTablet || isSmallScreen;

    return {
        isMobile: isMobileDevice,
        isPhone,
        isTablet,
        userAgent
    };
};

/**
 * Returns true if the current device is mobile (phone, tablet, or small screen).
 * All mobile devices now get the new mobile landing experience.
 */
export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    const details = getDeviceDetails();
    return details.isMobile;
};
