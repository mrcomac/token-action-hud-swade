import {SavageRollHandler} from './core-rollhandler.js'
import { MODULE } from './constants.js'
export let BR2RollHandler = null

Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {
    BR2RollHandler = class BR2RollHandler extends SavageRollHandler  {
        
        /** @override */
        async _rollItem(event, actionId, actor) {            
            const item = actor.items.filter(el => el.id === actionId)[0];

            if(item.type === 'consumable') {
                await item.show()
                return
            }
            const behavior = game.brsw.get_action_from_click(event);

            if (behavior === "trait") {
                await game.brsw
                    .create_item_card(actor, actionId)
                    .then((message) => {
                        game.brsw.roll_item(message, $(message.content), false);
                    });
            } else if (behavior === "trait_damage") {
                await game.brsw
                    .create_item_card(this.token, actionId)
                    .then((message) => {
                        game.brsw.roll_item(message, "", false, true);
                    });
            } else if (behavior === "system") {
                await game.swade.rollItemMacro(actor.items.get(actionId).name);
            } else if(behavior == 'dialog'){
                await game.brsw.create_item_card(actor, actionId).then(br_card => {
                    game.brsw.dialog.show_card(br_card);
                })
                
            } else {
                await game.brsw.create_item_card(actor, actionId);
            }
        }

        /** @override */
        _rollAttribute(event, actionId) {
            const behavior = game.brsw.get_action_from_click(event);

            if (behavior === "trait" || behavior === "trait_damage") {
                game.brsw
                    .create_atribute_card(this.token, actionId)
                    .then((message) => {
                        game.brsw.roll_attribute(message, false);
                    });
            } else if (behavior === "system") {
                this.token.actor.rollAttribute(actionId);
            } else if(behavior == 'dialog'){
                game.brsw.create_atribute_card(this.token, actionId).then(br_card => {
                    game.brsw.dialog.show_card(br_card);
                })
                
            } else {
                game.brsw.create_atribute_card(this.token, actionId);
            }
        }

        /** @override */
        _rollSkill(event, actionId, actor) {
            const behavior = game.brsw.get_action_from_click(event);

            if (behavior === "trait" || behavior === "trait_damage") {
                game.brsw
                    .create_skill_card(actor, actionId)
                    .then((message) => {
                        game.brsw.roll_skill(message, false);
                    });
            } else if (behavior === "system") {
                game.swade.rollItemMacro(actor.items.get(actionId).name);
            } else if(behavior == 'dialog'){
                game.brsw.create_skill_card(actor, actionId).then(br_card => {
                    game.brsw.dialog.show_card(br_card);
                })
                
            } else {
                game.brsw.create_skill_card(actor, actionId);
            }
        }

    }
})