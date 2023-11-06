import {SavageRollHandler} from './core-rollhandler.js'
export let BR2RollHandler = null

Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {
    BR2RollHandler = class BR2RollHandler extends SavageRollHandler  {
               
        /** @override */
        _rollItem(event, actionId) {
            let behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
            
            const item = this.token.actor.items.filter(el => el.id === actionId)[0];

            if(item.type === 'consumable') {
                item.show()
                return
            }
            if (behavior === "trait") {
                game.brsw
                    .create_item_card(this.token, actionId)
                    .then((message) => {
                        game.brsw.roll_item(message, $(message.data.content), false);
                    });
            } else if (behavior === "trait_damage") {
                game.brsw
                    .create_item_card(this.token, actionId)
                    .then((message) => {
                        game.brsw.roll_item(message, $(message.data.content), false, true);
                    });
            } else if (behavior === "system") {
                game.swade.rollItemMacro(this.token.actor.items.get(actionId).name);
            } else {
                game.brsw.create_item_card(this.token, actionId);
            }
        }

        /** @override */
        _rollAttribute(event, actionId) {
            let behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
            if (behavior === "trait" || behavior === "trait_damage") {
                game.brsw
                    .create_atribute_card(this.token, actionId)
                    .then((message) => {
                        game.brsw.roll_attribute(message, $(message.data.content), false);
                    });
            } else if (behavior === "system") {
                this.token.actor.rollAttribute(actionId);
            } else {
                game.brsw.create_atribute_card(this.token, actionId);
            }
        }

        /** @override */
        _rollSkill(event, actionId) {
            let behavior;
            if (event.ctrlKey === true) {
                behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
            } else if (event.altKey === true) {
                behavior = game.settings.get("betterrolls-swade2", "alt_click");
            } else if (event.shiftKey === true) {
                behavior = game.settings.get("betterrolls-swade2", "shift_click");
            } else {
                behavior = game.settings.get("betterrolls-swade2", "click");
            }
            if (behavior === "trait" || behavior === "trait_damage") {
                game.brsw
                    .create_skill_card(this.token, actionId)
                    .then((message) => {
                        game.brsw.roll_skill(message, $(message.data.content), false);
                    });
            } else if (behavior === "system") {
                game.swade.rollItemMacro(this.token.actor.items.get(actionId).name);
            } else {
                game.brsw.create_skill_card(this.token, actionId);
            }
        }

    }
})