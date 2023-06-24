
export let SwadeToolsRollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {

    SwadeToolsRollHandler = class SwadeToolsRollHandler extends coreModule.api.RollHandler {
        
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
                case "powers":
                    this._rollItem(event, actor, actionId);
                break;
                case "consumables":
                    const item = actor.items.filter(el => el.id === actionId)[0];
                    item.show()
                break
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

        /** @private */
        _rollItem(event, actor, actionId) {
            game.swadetools.item(actor,actionId)
        }

        /** @private */
        async _toggleStatus(event, actor, actionId, tokenId) {
            const existsOnActor = actor.effects.find(
                e => e.getFlag("core", "statusId") == actionId);
            const data = game.swade.util.getStatusEffectDataById(actionId);
            data["flags.core.statusId"] = actionId;
            await canvas.tokens.get(tokenId).toggleEffect(data, { active: !existsOnActor });
        }

        /** @private */
        _adjustBennies(event, actor, actionId) {
            if (actionId === "spend") {
                actor.spendBenny();
            }

            if (actionId === "give") actor.getBenny();
        }

        /** @private */
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

        /** @private */
        async _rollAttribute(event, actor, actionId) {
            await game.swadetools.attribute(actor,actionId)
        }

        /** @private */
        async _rollSkill(event, actor, actionId) {
            await game.swadetools.skill(actor,actionId)
        }

        async _run(event,actor,actionId) {
            await game.swadetools.run(actor)
        }

        /** @private */
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