/**
 * Telegram WebApp API Integration
 * เชื่อมต่อกับ Telegram Mini App API
 */

class TelegramAPI {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.initData = null;
        
        this.init();
    }

    /**
     * Initialize Telegram WebApp
     */
    init() {
        if (!this.tg) {
            console.warn('Telegram WebApp is not available');
            // Mock data for development
            this.user = {
                id: 123456789,
                first_name: 'Demo',
                last_name: 'User',
                username: 'demouser',
                language_code: 'th'
            };
            return;
        }

        try {
            // Expand the WebApp to full height
            this.tg.expand();
            
            // Enable closing confirmation
            this.tg.enableClosingConfirmation();
            
            // Set header color
            this.tg.setHeaderColor('#121826');
            
            // Set background color
            this.tg.setBackgroundColor('#121826');
            
            // Get user data
            this.user = this.tg.initDataUnsafe?.user;
            this.initData = this.tg.initData;
            
            // Setup main button
            this.setupMainButton();
            
            // Setup back button
            this.setupBackButton();
            
            // Listen for theme changes
            this.tg.onEvent('themeChanged', this.handleThemeChange.bind(this));
            
            // Listen for viewport changes
            this.tg.onEvent('viewportChanged', this.handleViewportChange.bind(this));
            
            console.log('Telegram WebApp initialized successfully');
            console.log('User:', this.user);
            
        } catch (error) {
            console.error('Failed to initialize Telegram WebApp:', error);
        }
    }

    /**
     * Setup Main Button
     */
    setupMainButton() {
        if (!this.tg?.MainButton) return;
        
        this.tg.MainButton.setText('Continue');
        this.tg.MainButton.setParams({
            color: '#3b82f6',
            text_color: '#ffffff'
        });
        
        // Hide by default
        this.tg.MainButton.hide();
        
        // Click handler
        this.tg.MainButton.onClick(() => {
            this.handleMainButtonClick();
        });
    }

    /**
     * Setup Back Button
     */
    setupBackButton() {
        if (!this.tg?.BackButton) return;
        
        // Hide by default
        this.tg.BackButton.hide();
        
        // Click handler
        this.tg.BackButton.onClick(() => {
            this.handleBackButtonClick();
        });
    }

    /**
     * Handle Main Button Click
     */
    handleMainButtonClick() {
        console.log('Main button clicked');
        // Implement main button logic here
        this.sendData({ action: 'main_button_clicked' });
    }

    /**
     * Handle Back Button Click
     */
    handleBackButtonClick() {
        console.log('Back button clicked');
        // Navigate back or close app
        window.history.back();
    }

    /**
     * Handle Theme Change
     */
    handleThemeChange() {
        console.log('Theme changed:', this.tg.colorScheme);
        // Update app theme based on Telegram theme
        this.updateAppTheme(this.tg.colorScheme);
    }

    /**
     * Handle Viewport Change
     */
    handleViewportChange() {
        console.log('Viewport changed:', this.tg.viewportHeight);
        // Adjust app layout
        document.documentElement.style.setProperty('--tg-viewport-height', `${this.tg.viewportHeight}px`);
    }

    /**
     * Update App Theme
     */
    updateAppTheme(colorScheme) {
        if (colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    /**
     * Show Main Button
     */
    showMainButton(text = 'Continue', params = {}) {
        if (!this.tg?.MainButton) return;
        
        this.tg.MainButton.setText(text);
        this.tg.MainButton.setParams({
            color: '#3b82f6',
            text_color: '#ffffff',
            ...params
        });
        this.tg.MainButton.show();
    }

    /**
     * Hide Main Button
     */
    hideMainButton() {
        if (!this.tg?.MainButton) return;
        this.tg.MainButton.hide();
    }

    /**
     * Show Back Button
     */
    showBackButton() {
        if (!this.tg?.BackButton) return;
        this.tg.BackButton.show();
    }

    /**
     * Hide Back Button
     */
    hideBackButton() {
        if (!this.tg?.BackButton) return;
        this.tg.BackButton.hide();
    }

    /**
     * Send Data to Bot
     */
    sendData(data) {
        if (!this.tg) {
            console.log('Mock sending data:', data);
            return;
        }
        
        try {
            this.tg.sendData(JSON.stringify(data));
        } catch (error) {
            console.error('Failed to send data:', error);
        }
    }

    /**
     * Close App
     */
    close() {
        if (!this.tg) {
            window.close();
            return;
        }
        
        this.tg.close();
    }

    /**
     * Show Alert
     */
    showAlert(message) {
        if (!this.tg) {
            alert(message);
            return;
        }
        
        this.tg.showAlert(message);
    }

    /**
     * Show Confirm
     */
    showConfirm(message, callback) {
        if (!this.tg) {
            const result = confirm(message);
            callback(result);
            return;
        }
        
        this.tg.showConfirm(message, callback);
    }

    /**
     * Show Popup
     */
    showPopup(params) {
        if (!this.tg) {
            alert(params.message || 'Popup');
            return;
        }
        
        this.tg.showPopup(params);
    }

    /**
     * Open Link
     */
    openLink(url, options = {}) {
        if (!this.tg) {
            window.open(url, '_blank');
            return;
        }
        
        if (options.try_instant_view) {
            this.tg.openTelegramLink(url);
        } else {
            this.tg.openLink(url, options);
        }
    }

    /**
     * Request Contact
     */
    requestContact(callback) {
        if (!this.tg) {
            console.log('Contact request not available in non-Telegram environment');
            return;
        }
        
        this.tg.requestContact(callback);
    }

    /**
     * Request Location
     */
    requestLocation(callback) {
        if (!this.tg) {
            console.log('Location request not available in non-Telegram environment');
            return;
        }
        
        this.tg.requestLocation(callback);
    }

    /**
     * Haptic Feedback
     */
    hapticFeedback(type = 'impact', style = 'medium') {
        if (!this.tg?.HapticFeedback) return;
        
        switch (type) {
            case 'impact':
                this.tg.HapticFeedback.impactOccurred(style);
                break;
            case 'notification':
                this.tg.HapticFeedback.notificationOccurred(style);
                break;
            case 'selection':
                this.tg.HapticFeedback.selectionChanged();
                break;
        }
    }

    /**
     * Read Text from Clipboard
     */
    readTextFromClipboard(callback) {
        if (!this.tg) {
            // Fallback for non-Telegram environment
            if (navigator.clipboard) {
                navigator.clipboard.readText().then(callback).catch(console.error);
            }
            return;
        }
        
        this.tg.readTextFromClipboard(callback);
    }

    /**
     * Request Write Access
     */
    requestWriteAccess(callback) {
        if (!this.tg) {
            console.log('Write access not available in non-Telegram environment');
            return;
        }
        
        this.tg.requestWriteAccess(callback);
    }

    /**
     * Get User Data
     */
    getUserData() {
        return this.user;
    }

    /**
     * Get Init Data
     */
    getInitData() {
        return this.initData;
    }

    /**
     * Get Version
     */
    getVersion() {
        return this.tg?.version || '7.0';
    }

    /**
     * Get Platform
     */
    getPlatform() {
        return this.tg?.platform || 'web';
    }

    /**
     * Get Color Scheme
     */
    getColorScheme() {
        return this.tg?.colorScheme || 'light';
    }

    /**
     * Is Expanded
     */
    isExpanded() {
        return this.tg?.isExpanded || false;
    }

    /**
     * Get Viewport Height
     */
    getViewportHeight() {
        return this.tg?.viewportHeight || window.innerHeight;
    }

    /**
     * Get Viewport Stable Height
     */
    getViewportStableHeight() {
        return this.tg?.viewportStableHeight || window.innerHeight;
    }

    /**
     * Check if feature is available
     */
    isFeatureAvailable(feature) {
        if (!this.tg) return false;
        
        const version = this.getVersion();
        const majorVersion = parseFloat(version);
        
        const featureVersions = {
            'web_app_open_link': 6.1,
            'web_app_open_tg_link': 6.1,
            'web_app_open_invoice': 6.1,
            'web_app_setup_main_button': 6.1,
            'web_app_setup_back_button': 6.1,
            'web_app_close': 6.0,
            'web_app_data_send': 6.0,
            'web_app_switch_inline_query': 6.6
        };
        
        return majorVersion >= (featureVersions[feature] || 6.0);
    }
}

// Create global instance
window.telegramAPI = new TelegramAPI();

export default TelegramAPI;