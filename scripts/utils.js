import { MAIN_ACTIONS, FREE_ACTIONS, MODULE } from './constants.js'

export let Utils = null

export function format_tooltip(original_str) {
    return original_str.replace(/@\w+\[.*?\]\{(.*?)\}/g, '$1');
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
            try {
                return game.settings.get(MODULE.ID, key);
            } catch (error) {
                coreModule.api.Logger.debug(`Error getting setting '${key}': ${error.message}`);
                return defaultValue;
            }
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

export function init_help_buttons(delimiter) {

    for (let i=0; i<MAIN_ACTIONS.length; i++) {
        MAIN_ACTIONS[i].encodedValue = ['main_action', MAIN_ACTIONS[i].id].join(delimiter)
        MAIN_ACTIONS[i].tooltip = format_tooltip(game.i18n.localize(MAIN_ACTIONS[i].tooltip))
        MAIN_ACTIONS[i].name = game.i18n.localize(MAIN_ACTIONS[i].name)
    }

    for (let i=0; i < FREE_ACTIONS.length; i++) {
        FREE_ACTIONS[i].encodedValue = ['main_action', FREE_ACTIONS[i].id].join(delimiter)
        FREE_ACTIONS[i].tooltip = format_tooltip(game.i18n.localize(FREE_ACTIONS[i].tooltip))
        FREE_ACTIONS[i].name = game.i18n.localize(FREE_ACTIONS[i].name)
    }

    return { MAIN_ACTIONS, FREE_ACTIONS }
}