export const REDIS_KEYS = {
    OTP: "otp",
    SEND_OTP:"SEND_OTP",
    WELCOME:"WELCOME",
    FORGOT_PASSWORD:"FORGOT_PASSWORD",
    COOLDOWN_KEY:"cooldown",
    RESET:"reset",
    PLATFORM_SETTINGS:"paltform-settings",
    BANNERS:"banners",
    ANNOUNCEMENTS:"announcements",
    RESTAURANT_KEY: function restaurant(restaurantId){
        return `restaurant:${restaurantId}`
    },

    MENU_KEY: function restaurantMenu(restaurantId){
        return `restaurant:${restaurantId}:menu`
    }
}

export const OTP_EXPIRY = 300 // 5 minutes expiration time
