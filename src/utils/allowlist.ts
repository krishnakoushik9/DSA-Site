/**
 * Clean scalable allowlist system for bypassing mobile device restrictions
 * on authorized developer/tester hardware and browsers.
 */

export interface ApprovedDevice {
    name: string;
    device: string;
    browser: string;
    email: string;
    accessKey: string;
    // Match function to verify if the user's browser/UA matches the expected environment
    match: (ua: string, maxTouchPoints: number) => boolean;
}

export const APPROVED_DEVICES: ApprovedDevice[] = [
    {
        name: "tneha",
        device: "Samsung Galaxy Tab A7 Lite",
        browser: "Chrome on Android",
        email: "tneha1028@gmail.com",
        accessKey: "tneha-tab-a7-lite",
        match: (ua: string) => {
            const isAndroid = /Android/i.test(ua);
            const isChrome = /Chrome|CriOS/i.test(ua);
            return isAndroid && isChrome;
        }
    },
    {
        name: "Krishna",
        device: "iPad Safari Testing",
        browser: "Safari",
        email: "krishnakoushik.pasupuleti@gmail.com",
        accessKey: "krishna-ipad-safari",
        match: (ua: string, maxTouchPoints: number) => {
            const isMacOrIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints > 0);
            const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Firefox|FxiOS/i.test(ua);
            return isMacOrIPad && isSafari;
        }
    },
    {
        name: "Internal QA Device",
        device: "QA Mobile/Tablet Testing",
        browser: "Any Mobile Browser",
        email: "qa@dsa-tracker.com",
        accessKey: "internal-qa-device",
        match: (ua: string) => {
            // Allows QA testing on any touch/mobile user agent
            return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
        }
    }
];

/**
 * Checks if the current browser environment has a valid and matched device bypass in localStorage.
 */
export const checkDeviceBypass = (): boolean => {
    if (typeof window === 'undefined') return false;
    const bypassKey = localStorage.getItem('dsa_tracker_authorized_device');
    if (!bypassKey) return false;

    const device = APPROVED_DEVICES.find(d => d.accessKey === bypassKey);
    if (!device) return false;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    return device.match(ua, maxTouchPoints);
};
