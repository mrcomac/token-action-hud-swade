export let BR2RollHandler = null

Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {
    BR2RollHandler = class BR2RollHandler extends coreModule.api.RollHandler {
        
        async doHandleActionEvent(event, encodedValue) {
            let payload = encodedValue.split("|");

            let macroType = payload[0];
            let tokenId = this.token.id;
            let actionId = payload[1];

            let actor = this.actor;

            let hasSheet = ["item"];
            if (this.isRenderItem() && hasSheet.includes(macroType)) {
                return this.doRenderItem(tokenId, actionId);
            }

            switch (macroType) {
                case "actions":
                case "item":
                case "weapons":
                case "gears":
                case "consumables":
                    this._rollItem(event, actor, actionId);
                    break;
                case "status":
                    await this._toggleStatus(event, actor, actionId, tokenId);
                    break;
                case "benny":
                    this._adjustBennies(event, actor, actionId);
                    break;
                case "gmBenny":
                    await this._adjustGmBennies(event, actor, actionId);
                    break;
                case "attributes":
                    this._rollAttribute(event, actor, actionId);
                    break;
                case "runningDie":
                    actor.rollRunningDie();
                    break;
                case "skills":
                    this._rollSkill(event, actor, actionId);
                    break;
                case "wounds":
                case "fatigue":
                case "powerPoints":
                    await this._adjustAttributes(event, actor, macroType, actionId);
                    break;
                case "utility":
                    if (actionId === "endTurn") {
                        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
                    }
                    break;
            }
        }

        
        /** @override */
        _rollItem(event, actor, actionId, tokenId) {
            
            let behavior;
            
            const item = actor.items.filter(el => el.id === actionId)[0];

            if(item.type === 'consumable') {
                item.show()
                return
            }

            if (event.ctrlKey === true) {
                behavior = game.settings.get("betterrolls-swade2", "ctrl_click");
            } else if (event.altKey === true) {
                behavior = game.settings.get("betterrolls-swade2", "alt_click");
            } else if (event.shiftKey === true) {
                behavior = game.settings.get("betterrolls-swade2", "shift_click");
            } else {
                behavior = game.settings.get("betterrolls-swade2", "click");
            }
            
            if (behavior === "trait") {
                game.brsw
                    .create_item_card_from_id(tokenId, actor.id, actionId)
                    .then((message) => {
                        game.brsw.roll_item(message, $(message.data.content), false);
                    });
            } else if (behavior === "trait_damage") {
                game.brsw
                    .create_item_card_from_id(tokenId, actor.id, actionId)
                    .then((message) => {
                        game.brsw.roll_item(message, $(message.data.content), false, true);
                    });
            } else if (behavior === "system") {
                game.swade.rollItemMacro(actor.items.get(actionId).name);
            } else {
                game.brsw.create_item_card_from_id(tokenId, actor.id, actionId);
            }
        }

        /** @override */
        async _toggleStatus(event, actor, actionId, tokenId) {
            const existsOnActor = actor.effects.find(
                e => e.getFlag("core", "statusId") == actionId);
            const data = game.swade.util.getStatusEffectDataById(actionId);
            data["flags.core.statusId"] = actionId;
            await canvas.tokens.get(tokenId).toggleEffect(data, { active: !existsOnActor });
        }

        /** @override */
        _adjustBennies(event, actor, actionId) {
            if (actionId === "spend") {
                actor.spendBenny();
            }

            if (actionId === "give") actor.getBenny();
        }

        /** @override */
        async _adjustGmBennies(event, actor, actionId) {
            let user = game.user;
            if (!user.isGM) return;

            const benniesValue = user.getFlag("swade", "bennies");
            if (actionId === "spend") {
                game.user.spendBenny()
            }

            if (actionId === "give") {
                game.user.getBenny()
            }

            Hooks.callAll("forceUpdateTokenActionHUD");
        }

        /** @override */
        _rollAttribute(event, actor, actionId, tokenId) {
            //actor.rollAttribute(actionId, {event: event});
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
                    .create_attribute_card_from_id(tokenId, actor.id, actionId)
                    .then((message) => {
                        game.brsw.roll_attribute(message, $(message.data.content), false);
                    });
            } else if (behavior === "system") {
                actor.rollAttribute(actionId);
            } else {
                game.brsw.create_attribute_card_from_id(tokenId, actor.id, actionId);
            }
        }

        /** @override */
        _rollSkill(event, actor, actionId, tokenId) {
            //actor.rollSkill(actionId, {event: event});
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
                    .create_skill_card_from_id(tokenId, actor.id, actionId)
                    .then((message) => {
                        game.brsw.roll_skill(message, $(message.data.content), false);
                    });
            } else if (behavior === "system") {
                game.swade.rollItemMacro(actor.items.get(actionId).name);
            } else {
                game.brsw.create_skill_card_from_id(tokenId, actor.id, actionId);
            }
        }

        /** @override */
        async _adjustAttributes(event, actor, macroType, actionId) {
            const actionIdArray = actionId.split(">");
            const changeType = actionIdArray[0];
            const pool = (actionIdArray.length > 0) ? actionIdArray[1] : null;
            let attribute = (macroType === 'powerPoints')
                ? actor.system[macroType][pool]
                : actor.system[macroType];

            if (!attribute) return;

            const curValue = attribute.value;
            const max = attribute.max;
            const min = attribute.min ?? 0;

            let value;
            switch (changeType) {
                case "increase":
                    value = Math.clamped(curValue + 1, min, max);
                    break;
                case "decrease":
                    value = Math.clamped(curValue - 1, min, max);
                    break;
            }

            let update = { data: {} };

            update.data[macroType] = (macroType === 'powerPoints')
                ? { [pool]: { value: value } }
                : { value: value };

            await actor.update(update);
        }

    }
})