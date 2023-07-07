export let SavageRollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    SavageRollHandler = class SavageRollHandler extends coreModule.api.RollHandler {
        
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
                case "powers":
                    this._rollItem(event, actor, actionId);
                    break;
                case "effects":
                case "statuses":
                    await this._toggleStatus(macroType, actor, actionId, tokenId);
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
                    this._run();
                    break;
                case "skills":
                    this._rollSkill(event, actor, actionId);
                    break;
                /*case "powerPoints":
                    await this._adjustAttributes(event, actor, macroType, actionId);
                    break;*/
                case "utility":
                    if (actionId === "endTurn") {
                        if (game.combat?.current?.tokenId === tokenId) await game.combat?.nextTurn();
                    }
                    break;
                case "wounds":
                case "fatigue":
                case "powerPoints":
                    if(actionId != "NONE")
                        this._wounds(macroType,actor,actionId)
                break;
            }
        }

        _run() {
            this.actor.rollRunningDie();
        }

        _wounds(event,actor,actionId) {
            let update = { data: { } };
            let poll = actionId.split(">")
            if(poll.length == 2) actionId = poll[0]
            if(actionId == "add") {
                if(event == 'powerPoints') {
                    let p = poll[1]
                    update["data"][event] = {}
                    update["data"][event][p] = {
                        value: actor.system[event][p].value + 1
                    }
                } else {
                    update["data"][event]= {
                        value: actor.system[event].value + 1
                    }
                }
            }
            else if(actionId == "remove") {
                if(event == 'powerPoints') {
                    let p = poll[1]
                    update["data"][event] = {}
                    update["data"][event][p]= {
                        value: actor.system[event][p].value - 1
                    }
                } else if(actor.system[event].value > 0) {
                    update["data"][event]= {
                        value: actor.system[event].value - 1
                    }
                }
                
            }
            actor.update(update)
        }

        /** @private */
        _rollItem(event, actor, actionId) {
            const item = actor.items.filter(el => el.id === actionId)[0];
            item.show();
        }

        /** @private */
        async _toggleStatus(event, actor, actionId, tokenId) {
            if(event != "effects") {
                const existsOnActor = this.actor.statuses.has(actionId.toLowerCase())
                const data = game.swade.util.getStatusEffectDataById(actionId.toLowerCase());
                data["flags.core.statusId"] = actionId;
                await this.token.toggleEffect(data, { active: !existsOnActor });
                
            } else {
                let effect = this.actor.effects.filter(el => el.id === actionId)[0]
                await this.actor.effects.filter(el => el.id === actionId)[0].update({ disabled: !effect.disabled })
            }
            game.tokenActionHud.update()
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
        _rollAttribute(event, actor, actionId) {
            actor.rollAttribute(actionId, { event: event });
        }

        /** @private */
        _rollSkill(event, actor, actionId) {
            actor.rollSkill(actionId, { event: event });
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