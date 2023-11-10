import { MODULE } from './constants.js'

export function register (updateFunc) {
    const targetModule = game.modules.get("betterrolls-swade2");
    if (targetModule && targetModule.active) {
        game.settings.register(MODULE.ID, 'br2RollsBehaviour', {
            name: "Select HUD's behavour when using Better Rolls module",
            hint: "By selecting one of the options from the dropdown menu, you can tailor the behavior of the HUD module to simulate ctrl and alt keys pressed.This customization enhances your experience with the Better Rolls module.",
            scope: "client",
            config: true,
            requiresReload: false,
            type: String,
            choices: {
                "click": "Single click action",
                "shift_click": "Shift click action",
                "alt_click": "Alt click action",
                "ctrl_click": "Crtl click action"
            },
            default: "single",
            onChange: (value) => {
                updateFunc(value)
            }
        })
    }

    
}
