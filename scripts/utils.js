import { MODULE } from './constants.js'

export let Utils = null

export function format_tooltip(original_str) {
    const pattern = /@\w+\[.*?\]\{(.*?)\}/g;
    let formatted_str = original_str.replace(pattern, '$1');
    return formatted_str;
}

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    Utils = class Utils {
    /**
     * Get setting value
     * @param {string} key The key
     * @param {string=null} defaultValue The default value
     * @returns The setting value
     */
        static getSetting (key, defaultValue = null) {
            let value = defaultValue ?? null
            try {
                value = game.settings.get(MODULE.ID, key)
            } catch {
                coreModule.api.Logger.debug(`Setting '${key}' not found`)
            }
            return value
        }

        /**
     * Set setting value
     * @param {string} key The key
     * @param {string} value The value
     */
        static async setSetting (key, value) {
            try {
                value = await game.settings.set(MODULE.ID, key, value)
                coreModule.api.Logger.debug(`Setting '${key}' set to '${value}'`)
            } catch {
                coreModule.api.Logger.debug(`Setting '${key}' not found`)
            }
        }
    
        /**
         * Returns the localized string for a given attribute
         * @param {string} attribute The id of the attribute 
         */
        static getLocalizedAttributeName(attribute) {
            if (attribute === "agility") {
                return game.i18n.localize("SWADE.AttrAgi");
            } else if (attribute === "smarts") {
                return game.i18n.localize("SWADE.AttrSma");
            } else if (attribute === "spirit") {
                return game.i18n.localize("SWADE.AttrSpr");
            } else if (attribute === "strength") {
                return game.i18n.localize("SWADE.AttrStr");
            } else if (attribute === "vigor") {
                return game.i18n.localize("SWADE.AttrVig");
            }
    
            return "Invalid Attribute";
        }
    }
})